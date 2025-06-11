import express from "express";
import { auth } from "../middleware/auth.js";
import {
  createCashOnDeliveryOrderController,
  createOnlinePaymentOrderController,
  getOrderDetailsByUserController,
  razorpayWebhookController,
  verifyRazorpayPaymentController,
} from "../controllers/order.controller.js";

const orderRouter = express.Router();

orderRouter.get("/get-order-details", auth, getOrderDetailsByUserController);
orderRouter.post(
  "/create-cod-order",
  auth,
  createCashOnDeliveryOrderController
);
orderRouter.post(
  "/create-online-order",
  auth,
  createOnlinePaymentOrderController
);
orderRouter.post("/razorpay-webhook", razorpayWebhookController);
orderRouter.post("/verify-payment", auth, verifyRazorpayPaymentController);

export default orderRouter;
