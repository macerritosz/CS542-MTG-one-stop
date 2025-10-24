import { Router } from "express";
import { getEventData } from "../controller/scrapeEvents.controller.ts";

const router = Router();

router.post("/scrapeevents", getEventData);

export default router;