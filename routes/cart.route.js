// Example routes (add to your routes file)
import {
  getCartController,
  addToCartController,
  removeFromCartController,
  clearCartController,
} from "../controllers/cart.controller.js";

router.get("/cart", authMiddleware, getCartController);
router.post("/cart/add", authMiddleware, addToCartController);
router.post("/cart/remove", authMiddleware, removeFromCartController);
router.post("/cart/clear", authMiddleware, clearCartController);
