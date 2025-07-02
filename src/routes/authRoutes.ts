// src/routes/authRoutes.ts (Atualizado)

import { Router } from "express";
import authController from "../Controllers/authController";
import { securityHandler } from "../Middlewares/authMiddlewares";

export const authRouter = Router()
  // Rotas públicas
  .post("/auth/login", authController.login.bind(authController))
  .post("/auth/refresh", authController.refreshToken.bind(authController))
  .post("/auth/forgot-password", authController.forgotPassword.bind(authController))
  .post("/auth/reset-password", authController.resetPassword.bind(authController))
  // Rotas protegidas
  .post("/auth/logout", securityHandler, authController.logout.bind(authController))
  .post("/auth/logout-all", securityHandler, authController.logoutAll.bind(authController));