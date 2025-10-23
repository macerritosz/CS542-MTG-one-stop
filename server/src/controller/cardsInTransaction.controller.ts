import type { Request, Response } from "express";
import CardsInTransaction from "../data/models/cardsInTransaction.model.ts";

export const createCardsInTransaction = async (req: Request, res: Response) => {
    try {
        // const {  } = req.body;
        const cardsInTransaction = await CardsInTransaction.create();
        res.status(201).json(cardsInTransaction);
    } catch (error) {
        res.status(500).json({ message: 'Failed creating cardsInTransaction', error });
    }
};

export const getCardsInTransactions = async (_req: Request, res: Response) => {
    try {
        const cardsInTransactions = await CardsInTransaction.findAll();
        res.status(200).json(cardsInTransactions);
    } catch (error) {
        res.status(500).json({ message: 'Failed getting cardsInTransactions', error });
    }
};
