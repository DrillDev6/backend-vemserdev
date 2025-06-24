import { Request, Response } from "express";
import userService from "../Services/userService";


export const createUser = async (req: Request, res: Response) => {
    const user = await userService.create(req.body);
    res.status(201).json(user);
};


export const getUserByName = async (req: Request, res: Response) => {

    const user = await userService.getUser(req.params.email);
    res.status(200).json(user);
};

export const updateUser = async (req: Request, res: Response) => {
    await userService.update(parseInt(req.params.id), req.body);
    res.status(204).json()
}; 


export const deleteUser = async (req: Request, res: Response) => {
    await userService.delete(parseInt(req.params.id));
    res.status(204).send();
};