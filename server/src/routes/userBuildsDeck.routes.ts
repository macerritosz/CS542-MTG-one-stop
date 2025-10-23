import { Router } from "express";
import { createUserBuildsDeck, getUserBuildsDecks } from "../controller/userBuildsDeck.controller.ts";

const router = Router();

router.post("/userBuildsDecks", createUserBuildsDeck);
router.get("/userBuildsDecks", getUserBuildsDecks);

export default router;