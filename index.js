import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();
import cookieParser from "cookie-parser";
import morgan from "morgan";
import helmet from "helmet";

const app = express();
app.use(
  cors({
    credentials: true,
    origin: process.env["FRONTEND.ORIGIN"] ?? "*",
  })
);
app.use(express.json());
app.use(cookieParser());
app.use(morgan("combined"));
app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);

const PORT = process.env["SERVER.PORT"] || 8080;

app.get("/", (request, response) => {
  return response.json({
    message: "Greetings user! Welcome to BlinkMart endpoint!!",
  });
});

app.listen(PORT, () => {
  console.log(`Server is up and running on PORT: ${PORT}`);
});
