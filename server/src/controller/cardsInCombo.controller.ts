import type { Request, Response } from "express";
import CardsInCombo from "../data/models/cardsInCombo.model.ts";

export const createCardsInCombo = async (req: Request, res: Response) => {
    try {
        // const {  } = req.body;
        const cardsInCombo = await CardsInCombo.create();
        res.status(201).json(cardsInCombo);
    } catch (error) {
        res.status(500).json({ message: 'Failed creating cardsInCombo', error });
    }
};

export const getCardsInCombos = async (_req: Request, res: Response) => {
    try {
        const cardsInCombos = await CardsInCombo.findAll();
        res.status(200).json(cardsInCombos);
    } catch (error) {
        res.status(500).json({ message: 'Failed getting cardsInCombos', error });
    }
};
