import express from "express";
import bcrypt from "bcryptjs";
import User from "../models/User.model.js";

const authRouter = express.Router();

authRouter.post("/register", async (req, res) => {
  const { username, email, password, fullName } = req.body;

  return res.status(201).json({
    id: "mockedUserId",
    username,
    email,
    fullName,
  });
});

export default authRouter;
