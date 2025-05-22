import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();
import cookieParser from "cookie-parser";
import morgan from "morgan";
import helmet from "helmet";
import connectDb from "./config/mongoDbConfig.js";
import userRouter from "./routes/user.route.js";
import categoryRouter from "./routes/category.route.js";
import subCategoryRouter from "./routes/subcategory.route.js";
import productRouter from "./routes/product.route.js";
import cartRouter from "./routes/cart.route.js";

const app = express();
app.use(
  cors({
    credentials: true,
    origin: process.env["FRONTEND_ORIGIN"] ?? "*",
  })
);
app.options("*", cors());
app.use(express.json());
app.use(cookieParser());
app.use(morgan("combined"));
app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);

const PORT = process.env["SERVER_PORT"] || 8080;

app.get("/", (request, response) => {
  // console.log(request?.cookies["accessToken"]);
  return response.json({
    message: "Greetings user! Welcome to BlinkMart endpoint!!",
  });
});

app.use("/api/v1/user", userRouter);
app.use("/api/v1/category", categoryRouter);
app.use("/api/v1/subcategory", subCategoryRouter);
app.use("/api/v1/product", productRouter);
app.use("/api/v1/cart", cartRouter);

connectDb()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is up and running on PORT: ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Stopping server, as Mongo Connection was unsuccessful...");
  });
