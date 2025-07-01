import { Request, Response } from "express";
import userService from "../Services/userService";

export class UserController {
    userService = userService;

    async createUser(req: Request, res: Response) {
        try {
            const user = await this.userService.create(req.body);
            res.status(201).json(user);
        } catch (error: any) {
            res.status(error.status || 500).json({ message: error.message || 'Erro interno' });
        }
    }

    async getUserByName(req: Request, res: Response) {
        try {
            const user = await this.userService.getUser(req.params.email);
            res.status(200).json(user);
        } catch (error: any) {
            res.status(error.status || 500).json({ message: error.message || 'Erro interno' });
        }
    }

    async updateUser(req: Request, res: Response) {
        try {
            await this.userService.update(parseInt(req.params.id), req.body);
            res.status(204).json();
        } catch (error: any) {
            res.status(error.status || 500).json({ message: error.message || 'Erro interno' });
        }
    }

    async deleteUser(req: Request, res: Response) {
        try {
            await this.userService.delete(parseInt(req.params.id));
            res.status(204).send();
        } catch (error: any) {
            res.status(error.status || 500).json({ message: error.message || 'Erro interno' });
        }
    }
}

export default new UserController();