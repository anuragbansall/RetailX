import express from "express";

import { register } from "../controllers/auth.controller.js";
import { registerValidation } from "../validations/auth.validation.js";
import validateRequest from "../middlewares/validateRequest.js";

const authRouter = express.Router();

authRouter.post("/register", registerValidation, validateRequest, register);

export default authRouter;
