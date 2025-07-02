// src/Controllers/authController.ts (Atualizado)

import { NextFunction, Request, Response } from "express";
import authService from "../Services/authService";

export class AuthController {
  
  /**
   * @swagger
   * /api/auth/login:
   *   post:
   *     summary: Login do usuário
   *     tags: [Auth]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - email
   *               - password
   *             properties:
   *               email:
   *                 type: string
   *                 format: email
   *               password:
   *                 type: string
   *                 format: password
   *     responses:
   *       200:
   *         description: Login realizado com sucesso
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 accessToken:
   *                   type: string
   *                 refreshToken:
   *                   type: string
   *                 expiresIn:
   *                   type: number
   *                 tokenType:
   *                   type: string
   *                 user:
   *                   type: object
   *                   properties:
   *                     id:
   *                       type: integer
   *                     name:
   *                       type: string
   *                     email:
   *                       type: string
   *       400:
   *         description: Credenciais inválidas
   */
  authService = authService;

  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;
      const result = await this.authService.login(email, password);
      res.status(200).json(result);
    } catch (error: any) {
      res.status(error.status || 400).json({
        success: false,
        message: error.message || "Erro no login"
      });
    }
  }

  /**
   * @swagger
   * /api/auth/refresh:
   *   post:
   *     summary: Renovar access token
   *     tags: [Auth]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - refreshToken
   *             properties:
   *               refreshToken:
   *                 type: string
   *     responses:
   *       200:
   *         description: Token renovado com sucesso
   *       400:
   *         description: Refresh token inválido
   */
  async refreshToken(req: Request, res: Response): Promise<void> {
    try {
      const { refreshToken } = req.body;
      
      if (!refreshToken) {
        res.status(400).json({
          success: false,
          message: "Refresh token é obrigatório"
        });
        return;
      }

      const result = await this.authService.refreshToken(refreshToken);
      res.status(200).json(result);
    } catch (error: any) {
      res.status(error.status || 400).json({
        success: false,
        message: error.message || "Erro ao renovar token"
      });
    }
  }

  /**
   * @swagger
   * /api/auth/logout:
   *   post:
   *     summary: Logout do usuário
   *     tags: [Auth]
   *     security:
   *       - BearerAuth: []
   *     responses:
   *       200:
   *         description: Logout realizado com sucesso
   *       401:
   *         description: Token inválido
   */
  async logout(req: Request, res: Response): Promise<void> {
    try {
      const token = req.headers.authorization?.split(" ")[1];
      
      if (!token) {
        res.status(401).json({
          success: false,
          message: "Token não fornecido"
        });
        return;
      }

      const result = await this.authService.logout(token);
      res.status(200).json({
        success: true,
        ...result
      });
    } catch (error: any) {
      res.status(error.status || 500).json({
        success: false,
        message: error.message || "Erro no logout"
      });
    }
  }

  /**
   * @swagger
   * /api/auth/logout-all:
   *   post:
   *     summary: Logout de todos os dispositivos
   *     tags: [Auth]
   *     security:
   *       - BearerAuth: []
   *     responses:
   *       200:
   *         description: Logout realizado em todos os dispositivos
   *       401:
   *         description: Token inválido
   */
  async logoutAll(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).userId; // Vem do middleware de autenticação
      
      if (!userId) {
        res.status(401).json({
          success: false,
          message: "Usuário não autenticado"
        });
        return;
      }

      const result = await this.authService.logoutAll(userId);
      res.status(200).json({
        success: true,
        ...result
      });
    } catch (error: any) {
      res.status(error.status || 500).json({
        success: false,
        message: error.message || "Erro no logout"
      });
    }
  }

  /**
   * @swagger
   * /api/auth/forgot-password:
   *   post:
   *     summary: Solicitar reset de senha
   *     tags: [Auth]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - email
   *             properties:
   *               email:
   *                 type: string
   *                 format: email
   *     responses:
   *       200:
   *         description: Token de reset enviado
   *       404:
   *         description: Usuário não encontrado
   */
  async forgotPassword(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;
      
      if (!email) {
        res.status(400).json({
          success: false,
          message: "Email é obrigatório"
        });
        return;
      }

      const result = await this.authService.requestPasswordReset(email);
      res.status(200).json({
        success: true,
        ...result
      });
    } catch (error: any) {
      res.status(error.status || 500).json({
        success: false,
        message: error.message || "Erro ao solicitar reset de senha"
      });
    }
  }

  /**
   * @swagger
   * /api/auth/reset-password:
   *   post:
   *     summary: Resetar senha
   *     tags: [Auth]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - token
   *               - newPassword
   *             properties:
   *               token:
   *                 type: string
   *               newPassword:
   *                 type: string
   *                 format: password
   *     responses:
   *       200:
   *         description: Senha alterada com sucesso
   *       400:
   *         description: Token inválido ou dados incorretos
   */
  async resetPassword(req: Request, res: Response): Promise<void> {
    try {
      const { token, newPassword } = req.body;
      
      if (!token || !newPassword) {
        res.status(400).json({
          success: false,
          message: "Token e nova senha são obrigatórios"
        });
        return;
      }

      if (newPassword.length < 6) {
        res.status(400).json({
          success: false,
          message: "A senha deve ter pelo menos 6 caracteres"
        });
        return;
      }

      const result = await this.authService.resetPassword(token, newPassword);
      res.status(200).json({
        success: true,
        ...result
      });
    } catch (error: any) {
      res.status(error.status || 500).json({
        success: false,
        message: error.message || "Erro ao resetar senha"
      });
    }
  }
}

export default new AuthController();

export function resetPassword(arg0: string, resetPassword: any) {
    throw new Error("Function not implemented.");
}
export function login(arg0: string, login: any) {
    throw new Error("Function not implemented.");
}

export function refreshToken(arg0: string, refreshToken: any) {
    throw new Error("Function not implemented.");
}

export function forgotPassword(arg0: string, forgotPassword: any) {
    throw new Error("Function not implemented.");
}

export function logout(arg0: string, securityHandler: (req: Request, res: Response, next: NextFunction) => void, logout: any) {
    throw new Error("Function not implemented.");
}

export function logoutAll(arg0: string, securityHandler: (req: Request, res: Response, next: NextFunction) => void, logoutAll: any) {
    throw new Error("Function not implemented.");
}

