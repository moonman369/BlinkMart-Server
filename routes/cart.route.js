// Example routes (add to your routes file)
import { Router } from "express";
import {
  getCartController,
  addToCartController,
  removeFromCartController,
  clearCartController,
} from "../controllers/cart.controller.js";
import { auth } from "../middleware/auth.js";

const cartRouter = Router();

cartRouter.get("/get-cart-by-user", auth, getCartController);
cartRouter.post("/add-to-cart", auth, addToCartController);
cartRouter.post("/remove-from-cart", auth, removeFromCartController);
cartRouter.delete("/clear-cart", auth, clearCartController);

export default cartRouter;
