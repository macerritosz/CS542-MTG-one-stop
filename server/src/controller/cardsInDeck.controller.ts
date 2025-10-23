import type { Request, Response } from "express";
import CardsInDeck from "../data/models/cardsInDeck.model.ts";

export const createCardsInDeck = async (req: Request, res: Response) => {
    try {
        // const {  } = req.body;
        const cardsInDeck = await CardsInDeck.create();
        res.status(201).json(cardsInDeck);
    } catch (error) {
        res.status(500).json({ message: 'Failed creating cardsInDeck', error });
    }
};

export const getCardsInDecks = async (_req: Request, res: Response) => {
    try {
        const cardsInDecks = await CardsInDeck.findAll();
        res.status(200).json(cardsInDecks);
    } catch (error) {
        res.status(500).json({ message: 'Failed getting cardsInDecks', error });
    }
};
