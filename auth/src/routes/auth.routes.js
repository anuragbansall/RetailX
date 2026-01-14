import express from "express";

import {
  getProfile,
  login,
  logout,
  register,
} from "../controllers/auth.controller.js";
import {
  loginValidation,
  registerValidation,
} from "../validations/auth.validation.js";
import validateRequest from "../middlewares/validateRequest.js";
import { authenticate } from "../middlewares/auth.js";

const authRouter = express.Router();

authRouter.post("/register", registerValidation, validateRequest, register);
authRouter.post("/login", loginValidation, validateRequest, login);
authRouter.post("/logout", authenticate, logout);
authRouter.get("/me", authenticate, getProfile);

export default authRouter;
