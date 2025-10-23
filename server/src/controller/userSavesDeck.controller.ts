import type { Request, Response } from "express";
import UserSavesDeck from "../data/models/userSavesDeck.model.ts";

export const createUserSavesDeck = async (req: Request, res: Response) => {
    try {
        // const {  } = req.body;
        const userSavesDeck = await UserSavesDeck.create();
        res.status(201).json(userSavesDeck);
    } catch (error) {
        res.status(500).json({ message: 'Failed creating userSavesDeck', error });
    }
};

export const getUserSavesDecks = async (_req: Request, res: Response) => {
    try {
        const userSavesDecks = await UserSavesDeck.findAll();
        res.status(200).json(userSavesDecks);
    } catch (error) {
        res.status(500).json({ message: 'Failed getting userSavesDecks', error });
    }
};
