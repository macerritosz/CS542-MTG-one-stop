import type { Request, Response } from "express";
import Card from "../data/models/card.model.ts";

export const createCard = async (req: Request, res: Response) => {
    try {
        // const {  } = req.body;
        const card = await Card.create();
        res.status(201).json(card);
    } catch (error) {
        res.status(500).json({ message: 'Failed creating card', error });
    }
};

export const getCards = async (_req: Request, res: Response) => {
    try {
        const cards = await Card.findAll();
        res.status(200).json(cards);
    } catch (error) {
        res.status(500).json({ message: 'Failed getting cards', error });
    }
};
