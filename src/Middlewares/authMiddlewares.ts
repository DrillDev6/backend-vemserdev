import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Extend Request interface para incluir user
declare global {
    namespace Express {
        interface Request {
            user?: any;
        }
    }
}

const JWT_SECRET = process.env.JWT_SECRET || 'institutoformar-backend-node';
