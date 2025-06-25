// src/Services/tokenService.ts

import jwt from "jsonwebtoken";
import { Op } from "sequelize";
import Token, { TokenType } from "../Models/Tokens";
import User from "../Models/Users";
import { BadRequestError, NotFoundError } from "../Models/exceptions";

const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || JWT_SECRET + "_refresh";

export class TokenService {
    
    /**
     * Gera um par de tokens (access + refresh)
     */
    async generateTokenPair(userId: number) {
        const user = await User.findByPk(userId);
        if (!user) {
            throw new NotFoundError("Usuário não encontrado");
        }

        // Gerar Access Token (24h)
        const accessToken = jwt.sign(
            { userId: user.id, email: user.email, type: 'access' },
            JWT_SECRET,
            { expiresIn: "24h" }
        );

        // Gerar Refresh Token (30 dias)
        const refreshToken = jwt.sign(
            { userId: user.id, type: 'refresh' },
            JWT_REFRESH_SECRET,
            { expiresIn: "30d" }
        );

        // Salvar tokens no banco
        const accessTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h
        const refreshTokenExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 dias

        await Token.create({
            user_id: userId,
            token: accessToken,
            type: TokenType.ACCESS,
            expires_at: accessTokenExpiry
        });

        await Token.create({
            user_id: userId,
            token: refreshToken,
            type: TokenType.REFRESH,
            expires_at: refreshTokenExpiry
        });

        return {
            accessToken,
            refreshToken,
            expiresIn: 24 * 60 * 60, // 24h em segundos
            tokenType: 'Bearer'
        };
    }

    /**
     * Renova o access token usando o refresh token
     */
    async refreshToken(refreshToken: string) {
        try {
            // Verificar se o refresh token é válido
            const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as any;
            
            // Buscar token no banco
            const tokenRecord = await Token.findOne({
                where: {
                    token: refreshToken,
                    type: TokenType.REFRESH,
                    is_revoked: false
                },
                include: [{ model: User, as: 'user' }]
            });

            if (!tokenRecord || !tokenRecord.isValid()) {
                throw new BadRequestError("Refresh token inválido ou expirado");
            }

            // Revogar o refresh token antigo
            await tokenRecord.update({ is_revoked: true });

            // Gerar novo par de tokens
            return await this.generateTokenPair(decoded.userId);

        } catch (error) {
            throw new BadRequestError("Refresh token inválido");
        }
    }

    /**
     * Valida um access token
     */
    async validateAccessToken(token: string) {
        try {
            const decoded = jwt.verify(token, JWT_SECRET) as any;
            
            const tokenRecord = await Token.findOne({
                where: {
                    token: token,
                    type: TokenType.ACCESS,
                    is_revoked: false
                },
                include: [{ model: User, as: 'user' }]
            });

            if (!tokenRecord || !tokenRecord.isValid()) {
                throw new BadRequestError("Token inválido ou expirado");
            }

            return {
                userId: decoded.userId,
                email: decoded.email,
                user: tokenRecord.user
            };

        } catch (error) {
            throw new BadRequestError("Token inválido");
        }
    }

    /**
     * Revoga um token específico
     */
    async revokeToken(token: string) {
        const tokenRecord = await Token.findOne({
            where: { token: token }
        });

        if (tokenRecord) {
            await tokenRecord.update({ is_revoked: true });
        }
    }

    /**
     * Revoga todos os tokens de um usuário
     */
    async revokeAllUserTokens(userId: number) {
        await Token.update(
            { is_revoked: true },
            {
                where: {
                    user_id: userId,
                    is_revoked: false
                }
            }
        );
    }

    /**
     * Gera token para reset de senha
     */
    async generatePasswordResetToken(email: string) {
        const user = await User.findOne({ where: { email } });
        if (!user) {
            throw new NotFoundError("Usuário não encontrado");
        }

        // Revogar tokens de reset anteriores
        await Token.update(
            { is_revoked: true },
            {
                where: {
                    user_id: user.id,
                    type: TokenType.RESET_PASSWORD,
                    is_revoked: false
                }
            }
        );

        // Gerar novo token (válido por 1 hora)
        const resetToken = jwt.sign(
            { userId: user.id, type: 'reset_password' },
            JWT_SECRET,
            { expiresIn: "1h" }
        );

        const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hora

        await Token.create({
            user_id: user.id,
            token: resetToken,
            type: TokenType.RESET_PASSWORD,
            expires_at: expiresAt
        });

        return resetToken;
    }

    /**
     * Valida token de reset de senha
     */
    async validatePasswordResetToken(token: string) {
        try {
            const decoded = jwt.verify(token, JWT_SECRET) as any;
            
            const tokenRecord = await Token.findOne({
                where: {
                    token: token,
                    type: TokenType.RESET_PASSWORD,
                    is_revoked: false
                },
                include: [{ model: User, as: 'user' }]
            });

            if (!tokenRecord || !tokenRecord.isValid()) {
                throw new BadRequestError("Token de reset inválido ou expirado");
            }

            return tokenRecord.user;

        } catch (error) {
            throw new BadRequestError("Token de reset inválido");
        }
    }

    /**
     * Limpa tokens expirados (para ser executado em cron job)
     */
    async cleanExpiredTokens() {
        const expiredCount = await Token.destroy({
            where: {
                [Op.or]: [
                    { expires_at: { [Op.lt]: new Date() } },
                    { is_revoked: true }
                ]
            }
        });

        return expiredCount;
    }

    /**
     * Lista tokens ativos de um usuário
     */
    async getUserActiveTokens(userId: number) {
        return Token.findAll({
            where: {
                user_id: userId,
                is_revoked: false,
                expires_at: { [Op.gt]: new Date() }
            },
            order: [['created_at', 'DESC']]
        });
    }
}

export default new TokenService();