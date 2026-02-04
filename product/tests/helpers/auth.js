import jwt from "jsonwebtoken";
import mongoose from "mongoose";

export const makeToken = (payload = { id: new mongoose.Types.ObjectId().toString(), role: "seller" }) => {
  const secret = process.env.JWT_SECRET || "testsecret";
  return jwt.sign(payload, secret);
};

export const setCookie = (token) => [`token=${token}`];
