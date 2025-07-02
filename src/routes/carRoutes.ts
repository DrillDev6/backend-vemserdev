import { Router } from "express";
import carController from '../Controllers/carController';
import { securityHandler, isAdmin } from '../Middlewares/authMiddlewares';

export const carRouter = Router()

// Apenas admin pode registrar, atualizar e deletar carros
.post("/cars/registry", securityHandler, isAdmin, carController.registryCar.bind(carController))
.patch("/update-car/:id", securityHandler, isAdmin, carController.updateCar.bind(carController))
.delete("/delete-car/:id", securityHandler, isAdmin, carController.deleteCar.bind(carController))

// Qualquer usuário autenticado pode ver carros
.get("/cars/:id", securityHandler, carController.getCarById.bind(carController));
