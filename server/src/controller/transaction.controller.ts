import type { Request, Response } from "express";
import Transaction from "../data/models/transaction.model.ts";

export const createTransaction = async (req: Request, res: Response) => {
    try {
        // const {  } = req.body;
        const transaction = await Transaction.create();
        res.status(201).json(transaction);
    } catch (error) {
        res.status(500).json({ message: 'Failed creating transaction', error });
    }
};

export const getTransactions = async (_req: Request, res: Response) => {
    try {
        const transactions = await Transaction.findAll();
        res.status(200).json(transactions);
    } catch (error) {
        res.status(500).json({ message: 'Failed getting transactions', error });
    }
};
