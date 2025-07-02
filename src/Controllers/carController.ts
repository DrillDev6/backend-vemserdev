import {Request, Response, NextFunction} from "express";
import carServices from "../Services/carService";

export class CarController {
    carServices = carServices;

    async registryCar(req: Request, res: Response, next: NextFunction) {
        try {
            const user = await this.carServices.registry(req.body);
            res.status(201).json(user);
        } catch (error: any) {
            res.status(error.status || 500).json({ message: error.message || 'Erro interno' });
        }
    }

    async getCarById(req: Request, res: Response, next: NextFunction) {
        try {
            const car = await this.carServices.getCars(parseInt(req.params.id));
            res.status(200).json(car);
        } catch (error: any) {
            res.status(error.status || 500).json({ message: error.message || 'Erro interno' });
        }
    }

    async updateCar(req: Request, res: Response, next: NextFunction) {
        try {
            await this.carServices.update(parseInt(req.params.id), req.body);
            res.status(204).json();
        } catch (error: any) {
            res.status(error.status || 500).json({ message: error.message || 'Erro interno' });
        }
    }

    async deleteCar(req: Request, res: Response, next: NextFunction) {
        try {
            await this.carServices.delete(parseInt(req.params.id));
            res.status(204).send();
        } catch (error: any) {
            res.status(error.status || 500).json({ message: error.message || 'Erro interno' });
        }
    }
}

export default new CarController();