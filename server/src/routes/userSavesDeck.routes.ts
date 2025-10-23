import { Router } from "express";
import { createUserSavesDeck, getUserSavesDecks } from "../controller/userSavesDeck.controller.ts";

const router = Router();

router.post("/userSavesDecks", createUserSavesDeck);
router.get("/userSavesDecks", getUserSavesDecks);

export default router;