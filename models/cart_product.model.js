import mongoose from "mongoose";

const cartProductSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.ObjectId,
      ref: "user",
    },
    product: {
      type: mongoose.Schema.ObjectId,
      ref: "product",
    },
    quantity: {
      type: Number,
      default: 1,
    },
  },
  {
    timestamps: true,
  }
);

const CartProductModel = mongoose.model("cart_product", cartProductSchema);

export default CartProductModel;
