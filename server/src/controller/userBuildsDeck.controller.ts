import type { Request, Response } from "express";
import UserBuildsDeck from "../data/models/userBuildsDeck.model.ts";

export const createUserBuildsDeck = async (req: Request, res: Response) => {
    try {
        // const {  } = req.body;
        const userBuildsDeck = await UserBuildsDeck.create();
        res.status(201).json(userBuildsDeck);
    } catch (error) {
        res.status(500).json({ message: 'Failed creating userBuildsDeck', error });
    }
};

export const getUserBuildsDecks = async (_req: Request, res: Response) => {
    try {
        const userBuildsDecks = await UserBuildsDeck.findAll();
        res.status(200).json(userBuildsDecks);
    } catch (error) {
        res.status(500).json({ message: 'Failed getting userBuildsDecks', error });
    }
};
