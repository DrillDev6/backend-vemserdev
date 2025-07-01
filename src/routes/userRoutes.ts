import { Router } from "express";
import { 
    deleteUser,
    getUserByName,
    updateUser,
    createUser,

} from "../Controllers/userController"

export const userRouter = Router()

.get("/users/:id", getUserByName)
.post("/users", createUser)
.patch("/users/:id", updateUser)
.delete("/users/:id", deleteUser);