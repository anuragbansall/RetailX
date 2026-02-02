import cookieParser from "cookie-parser";
import express from "express";
import productRouter from "./routes/product.routes.js";

const app = express();

app.use(express.json());
app.use(cookieParser());

app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "OK", message: "Product service is running" });
});

app.use("/api/products", productRouter);

export default app;
