import { NextFunction, Request, Response } from "express";
import * as jwt from "jsonwebtoken";

export const securityHandler = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    res.status(401).send({ message: "Unauthorized" });
    return;
  }
  jwt.verify(token, process.env.JWT_SECRET as string, (err, decoded: any) => {
    if (err) {
      res.status(401).send({ message: "Unauthorized" });
      return;
    }
    // Attach user info to req for later use
    (req as any).user = decoded;
    next();
  });
};

export const isAdmin = (req: Request, res: Response, next: NextFunction): void => {
  const user = (req as any).user;
  if (!user || user.role !== 'admin') {
    res.status(403).send({ message: 'Forbidden: Admins only' });
    return;
  }
  next();
};