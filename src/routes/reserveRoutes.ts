import { Router } from "express";
import {
    createReserve,
    getReserveById,
    getAllReserves,
    getReservesByUser,
    getReservesByCar,
    updateReserve,
    deleteReserve
} from "../Controllers/reserveController";

export const reserveRouter = Router()

    .get("/reserves", getAllReserves)
    .get("/reserves/:id", getReserveById)
    .get("/reserves/user/:userId", getReservesByUser)
    .get("/reserves/car/:carId", getReservesByCar)
    .post("/reserves", createReserve)
    .patch("/reserves/:id", updateReserve)
    .delete("/reserves/:id", deleteReserve);