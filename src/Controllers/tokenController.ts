import { Request, Response } from 'express';
import { TokenService } from '../Services/tokenService';

export class TokenController {
    tokenService = new TokenService();

    async generatePasswordResetToken(req: Request, res: Response) {
        try {
            const { email } = req.body;
            const token = await this.tokenService.generatePasswordResetToken(email);
            res.status(201).json({ token });
        } catch (error: any) {
            res.status(error.status || 500).json({ message: error.message || 'Erro interno' });
        }
    }

    async validatePasswordResetToken(req: Request, res: Response) {
        try {
            const { token } = req.body;
            const user = await this.tokenService.validatePasswordResetToken(token);
            res.status(200).json({ user });
        } catch (error: any) {
            res.status(error.status || 500).json({ message: error.message || 'Erro interno' });
        }
    }

    async revokeToken(req: Request, res: Response) {
        try {
            const { token } = req.body;
            await this.tokenService.revokeToken(token);
            res.status(204).send();
        } catch (error: any) {
            res.status(error.status || 500).json({ message: error.message || 'Erro interno' });
        }
    }

    async revokeAllUserTokens(req: Request, res: Response) {
        try {
            const { userId } = req.body;
            await this.tokenService.revokeAllUserTokens(userId);
            res.status(204).send();
        } catch (error: any) {
            res.status(error.status || 500).json({ message: error.message || 'Erro interno' });
        }
    }

    async getUserActiveTokens(req: Request, res: Response) {
        try {
            const { userId } = req.params;
            const tokens = await this.tokenService.getUserActiveTokens(Number(userId));
            res.status(200).json(tokens);
        } catch (error: any) {
            res.status(error.status || 500).json({ message: error.message || 'Erro interno' });
        }
    }
}

export default new TokenController();
