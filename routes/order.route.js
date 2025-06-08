import express from "express";
import { auth } from "../middleware/auth.js";
import {
  cashOnDeliveryOrderController,
  getOrderDetailsByUserController,
} from "../controllers/order.controller.js";

const orderRouter = express.Router();

orderRouter.get("/get-order-details", auth, getOrderDetailsByUserController);
orderRouter.post("/place-cod-order", auth, cashOnDeliveryOrderController);

export default orderRouter;
