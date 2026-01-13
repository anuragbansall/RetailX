import express from "express";

import { login, register } from "../controllers/auth.controller.js";
import {
  loginValidation,
  registerValidation,
} from "../validations/auth.validation.js";
import validateRequest from "../middlewares/validateRequest.js";

const authRouter = express.Router();

authRouter.post("/register", registerValidation, validateRequest, register);
authRouter.post("/login", loginValidation, validateRequest, login);

export default authRouter;
