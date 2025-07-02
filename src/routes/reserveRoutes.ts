import { Router } from "express";
import reserveController from "../Controllers/reserveController";
import { securityHandler, isAdmin } from "../Middlewares/authMiddlewares";

export const reserveRouter = Router()
  // Apenas admin pode ver todas as reservas
  .get("/reserves", securityHandler, isAdmin, reserveController.getAllReserves.bind(reserveController))
  // Usuário autenticado pode ver suas reservas e reservas por carro
  .get("/reserves/:id", securityHandler, reserveController.getReserveById.bind(reserveController))
  .get("/reserves/user/:userId", securityHandler, reserveController.getReservesByUser.bind(reserveController))
  .get("/reserves/car/:carId", securityHandler, reserveController.getReservesByCar.bind(reserveController))
  // Qualquer usuário autenticado pode criar, atualizar e deletar sua própria reserva
  .post("/reserves", securityHandler, reserveController.createReserve.bind(reserveController))
  .patch("/reserves/:id", securityHandler, reserveController.updateReserve.bind(reserveController))
  .delete("/reserves/:id", securityHandler, reserveController.deleteReserve.bind(reserveController));