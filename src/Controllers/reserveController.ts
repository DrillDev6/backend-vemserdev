import { Request, Response } from "express";
import reserveService from "../Services/reserveService";

export const createReserve = async (req: Request, res: Response) => {
    try {
        const reserve = await reserveService.create(req.body);
         res.status(201).json({
            success: true,
            message: "Reserva criada com sucesso",
            data: reserve
        });
    } catch (error: any) {
         res.status(error.status || 500).json({
            success: false,
            message: error.message || "Erro interno do servidor"
        });
    }
};

export const getReserveById = async (req: Request, res: Response) => {
    try {
        const reserve = await reserveService.getReserve(req.params.id);
         res.status(200).json({
            success: true,
            data: reserve
        });
    } catch (error: any) {
         res.status(error.status || 500).json({
            success: false,
            message: error.message || "Erro interno do servidor"
        });
    }
};

export const getAllReserves = async (req: Request, res: Response) => {
    try {
        const reserves = await reserveService.getAllReserves();
     res.status(200).json({
            success: true,
            data: reserves,
            count: reserves.length
        });
    } catch (error: any) {
     res.status(error.status || 500).json({
            success: false,
            message: error.message || "Erro interno do servidor"
        });
    }
};

export const getReservesByUser = async (req: Request, res: Response) => {
    try {
        const reserves = await reserveService.getReservesByUser(parseInt(req.params.userId));
         res.status(200).json({
            success: true,
            data: reserves,
            count: reserves.length
        });
    } catch (error: any) {
         res.status(error.status || 500).json({
            success: false,
            message: error.message || "Erro interno do servidor"
        });
    }
};

export const getReservesByCar = async (req: Request, res: Response) => {
    try {
        const reserves = await reserveService.getReservesByCar(parseInt(req.params.carId));
         res.status(200).json({
            success: true,
            data: reserves,
            count: reserves.length
        });
    } catch (error: any) {
         res.status(error.status || 500).json({
            success: false,
            message: error.message || "Erro interno do servidor"
        });
    }
};

export const updateReserve = async (req: Request, res: Response) => {
    try {
        const reserve = await reserveService.update(req.params.id, req.body);
         res.status(200).json({
            success: true,
            message: "Reserva atualizada com sucesso",
            data: reserve
        });
    } catch (error: any) {
         res.status(error.status || 500).json({
            success: false,
            message: error.message || "Erro interno do servidor"
        });
    }
};

export const deleteReserve = async (req: Request, res: Response) => {
    try {
        await reserveService.delete(req.params.id);
        res.status(200).json({
            success: true,
            message: "Reserva deletada com sucesso"
        });
    } catch (error: any) {
        res.status(error.status || 500).json({
            success: false,
            message: error.message || "Erro interno do servidor"
        });
    }
};

export default {};
