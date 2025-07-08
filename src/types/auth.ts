// types/auth.ts
import { Request, Response, NextFunction } from 'express';
import { JwtPayload } from 'jsonwebtoken';

// Interface para o request autenticado
export interface AuthRequest extends Request {
  user?: {
    id: number;
    email: string;
    role: string;
  };
}

// Interface para o payload do JWT
export interface AuthTokenPayload extends JwtPayload {
  id: number;
  email: string;
  role: string;
}

// Type para middleware de autenticação
export type AuthMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => Promise<void> | void;