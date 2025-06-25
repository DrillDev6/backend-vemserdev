import { Router } from "express";
import authController from "../Controllers/authController";

export const authRouter = Router().post("/token", authController.login);