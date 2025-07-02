import { Router } from "express";
import userController from "../Controllers/userController";
import { securityHandler, isAdmin } from "../Middlewares/authMiddlewares";

export const userRouter = Router()
  // Apenas admin pode listar, atualizar e deletar usuários
  .get("/users/:id", securityHandler, isAdmin, userController.getUserByName.bind(userController))
  .patch("/users/:id", securityHandler, isAdmin, userController.updateUser.bind(userController))
  .delete("/users/:id", securityHandler, isAdmin, userController.deleteUser.bind(userController))
  // Qualquer usuário pode se registrar
  .post("/users", userController.createUser.bind(userController));