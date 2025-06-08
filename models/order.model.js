import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.ObjectId,
      ref: "user",
    },
    order_id: {
      type: String,
      required: [true, "Required field `order_id` cannot be blank!"],
      unique: true,
    },
    products: [
      {
        product_id: {
          type: mongoose.Schema.ObjectId,
          ref: "product",
        },
        quantity: {
          type: Number,
          default: 1,
        },
      },
    ],
    payment_mode: {
      type: String,
      enum: ["COD", "Card", "UPI", "Net Banking"],
      default: "COD",
    },
    payment_id: {
      type: String,
      default: "",
    },
    delivery_address: {
      type: mongoose.Schema.ObjectId,
      ref: "address",
    },
    sub_total_amount: {
      type: Number,
      default: 0,
    },
    total_amount: {
      type: Number,
      default: 0,
    },
    invoice_receipt: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

const OrderModel = mongoose.model("order", orderSchema);

export default OrderModel;
