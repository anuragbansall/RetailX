import express from "express";

import {
  addAddress,
  deleteAddress,
  getAllAddresses,
  getProfile,
  login,
  logout,
  register,
} from "../controllers/auth.controller.js";
import {
  loginValidation,
  registerValidation,
  addAddressValidation,
  addressIdParamValidation,
} from "../validations/auth.validation.js";
import validateRequest from "../middlewares/validateRequest.js";
import { authenticate } from "../middlewares/auth.js";

const authRouter = express.Router();

authRouter.post("/register", registerValidation, validateRequest, register);
authRouter.post("/login", loginValidation, validateRequest, login);
authRouter.post("/logout", authenticate, logout);
authRouter.get("/me", authenticate, getProfile);
authRouter.get("/me/addresses", authenticate, getAllAddresses);
authRouter.post(
  "/me/addresses",
  authenticate,
  addAddressValidation,
  validateRequest,
  addAddress,
);
authRouter.delete(
  "/me/addresses/:addressId",
  authenticate,
  addressIdParamValidation,
  validateRequest,
  deleteAddress,
);

export default authRouter;
