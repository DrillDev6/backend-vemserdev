import { Request, Response } from "express";
import reserveService from "../Services/reserveService";

export class ReserveController {
    reserveService = reserveService;

    async createReserve(req: Request, res: Response): Promise<void> {
        try {
            const reserve = await this.reserveService.create(req.body);
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
    }

    async getReserveById(req: Request, res: Response): Promise<void> {
        try {
            const reserve = await this.reserveService.getReserve(req.params.id);
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
    }

    async getAllReserves(req: Request, res: Response): Promise<void> {
        try {
            const reserves = await this.reserveService.getAllReserves();
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
    }

    async getReservesByUser(req: Request, res: Response): Promise<void> {
        try {
            const reserves = await this.reserveService.getReservesByUser(parseInt(req.params.userId));
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
    }

    async getReservesByCar(req: Request, res: Response): Promise<void> {
        try {
            const reserves = await this.reserveService.getReservesByCar(parseInt(req.params.carId));
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
    }

    async updateReserve(req: Request, res: Response): Promise<void> {
        try {
            await this.reserveService.update(req.params.id, req.body);
            res.status(204).send();
        } catch (error: any) {
            res.status(error.status || 500).json({
                success: false,
                message: error.message || "Erro interno do servidor"
            });
        }
    }

    async deleteReserve(req: Request, res: Response): Promise<void> {
        try {
            await this.reserveService.delete(req.params.id);
            res.status(204).send();
        } catch (error: any) {
            res.status(error.status || 500).json({
                success: false,
                message: error.message || "Erro interno do servidor"
            });
        }
    }
}

export default new ReserveController();
