// src/routes/authRoutes.ts (Atualizado)

import { NextFunction, Router } from "express";
import * as authController from "../Controllers/authController";
import { securityHandler } from "../Middlewares/authMiddlewares";

export const authRouter = Router()
  // Rotas públicas
  .post("/auth/login", authController.login)
  .post("/auth/refresh", authController.refreshToken)
  .post("/auth/forgot-password", authController.forgotPassword)
  .post("/auth/reset-password", authController.resetPassword)
  
  // Rotas protegidas
  .post("/auth/logout", securityHandler, authController.logout)
  .post("/auth/logout-all", securityHandler, authController.logoutAll);