import express from "express";
import cookieParser from "cookie-parser";
import authRouter from "./routes/auth.routes";

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use("/auth", authRouter);

export default app;
