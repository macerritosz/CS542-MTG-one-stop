import type { Request, Response } from "express";
import User from "../data/models/user.model.ts";

export const createUser = async (req: Request, res: Response) => {
    try {
        const { username, email, password } = req.body;
        const user = await User.create({ username, email, password });
        res.status(201).json(user);
    } catch (error) {
        res.status(500).json({ message: 'Failed creating user', error });
    }
};

export const getUsers = async (_req: Request, res: Response) => {
    try {
        const users = await User.findAll();
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: 'Failed getting users', error });
    }
};
