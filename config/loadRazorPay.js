import Razorpay from "razorpay";
import dotenv from "dotenv";
dotenv.config();

export const razorpayInstance = new Razorpay({
  key_id: process.env.APP_RAZORPAY_KEY_ID,
  key_secret: process.env.APP_RAZORPAY_KEY_SECRET,
});
