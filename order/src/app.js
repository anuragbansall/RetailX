import cookieParser from "cookie-parser";
import express from "express";
import orderRouter from "./routes/order.routes.js";

const app = express();

app.use(express.json());
app.use(cookieParser());

app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "OK", message: "order service is running" });
});

app.use("/api/orders", orderRouter);

export default app;
