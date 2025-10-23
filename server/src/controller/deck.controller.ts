import type { Request, Response } from "express";
import Deck from "../data/models/deck.model.ts";

export const createDeck = async (req: Request, res: Response) => {
    try {
        // const {  } = req.body;
        const deck = await Deck.create();
        res.status(201).json(deck);
    } catch (error) {
        res.status(500).json({ message: 'Failed creating deck', error });
    }
};

export const getDecks = async (_req: Request, res: Response) => {
    try {
        const decks = await Deck.findAll();
        res.status(200).json(decks);
    } catch (error) {
        res.status(500).json({ message: 'Failed getting decks', error });
    }
};
