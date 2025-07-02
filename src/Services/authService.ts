// src/Services/authService.ts (Atualizado)

import bcrypt from "bcryptjs";
import User from "../Models/Users";
import { BadRequestError } from "../Models/exceptions";
import tokenService from "./tokenService";

export class AuthService {
  
  /**
   * Login do usuário com geração de tokens
   */
  async login(email: string, password: string) {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      throw new BadRequestError("Credenciais inválidas");
    }

    // Comparação de senha em texto puro
    if (user.password !== password) {
      throw new BadRequestError("Credenciais inválidas");
    }

    // Gerar par de tokens
    const tokens = await tokenService.generateTokenPair(user.id);

    return {
      ...tokens,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    };
  }

  /**
   * Renovar access token usando refresh token
   */
  async refreshToken(refreshToken: string) {
    return await tokenService.refreshToken(refreshToken);
  }

  /**
   * Logout do usuário (revoga o token)
   */
  async logout(token: string) {
    await tokenService.revokeToken(token);
    return { message: "Logout realizado com sucesso" };
  }

  /**
   * Logout de todos os dispositivos (revoga todos os tokens)
   */
  async logoutAll(userId: number) {
    await tokenService.revokeAllUserTokens(userId);
    return { message: "Logout realizado em todos os dispositivos" };
  }

  /**
   * Solicitar reset de senha
   */
  async requestPasswordReset(email: string) {
    const resetToken = await tokenService.generatePasswordResetToken(email);
    
    // Aqui você enviaria o token por email
    // Por enquanto, apenas retornamos o token (em produção, não fazer isso!)
    return {
      message: "Token de reset enviado para o email",
      resetToken // Remover esta linha em produção
    };
  }

  /**
   * Resetar senha usando token
   */
  async resetPassword(token: string, newPassword: string) {
    const user = await tokenService.validatePasswordResetToken(token);
    
    // Hash da nova senha
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Atualizar senha
    await user.update({ password: hashedPassword });
    
    // Revogar o token de reset
    await tokenService.revokeToken(token);
    
    // Revogar todos os tokens do usuário (forçar novo login)
    await tokenService.revokeAllUserTokens(user.id);

    return { message: "Senha alterada com sucesso" };
  }

  /**
   * Validar token de acesso
   */
  async validateToken(token: string) {
    return await tokenService.validateAccessToken(token);
  }
}

export default new AuthService();