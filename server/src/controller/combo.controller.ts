import type { Request, Response } from "express";
import Combo from "../data/models/combo.model.ts";

export const createCombo = async (req: Request, res: Response) => {
    try {
        // const {  } = req.body;
        const combo = await Combo.create();
        res.status(201).json(combo);
    } catch (error) {
        res.status(500).json({ message: 'Failed creating combo', error });
    }
};

export const getCombos = async (_req: Request, res: Response) => {
    try {
        const combos = await Combo.findAll();
        res.status(200).json(combos);
    } catch (error) {
        res.status(500).json({ message: 'Failed getting combos', error });
    }
};
