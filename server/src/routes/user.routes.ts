import { Router } from "express";
import { createUser, getUsers } from "../controller/user.controller.ts";

const router = Router();

router.post("/users", createUser);
router.get("/users", getUsers);

export default router;