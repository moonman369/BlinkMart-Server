import { Router } from "express";
import { auth } from "../middleware/auth.js";
import tempStorage from "../middleware/multer.js";
import {
  addProductController,
  getProductsController,
} from "../controllers/product.controller.js";

const productRouter = Router();

productRouter.post(
  "/add-product",
  auth,
  tempStorage.array("images"),
  addProductController
);
productRouter.get("/get-products", auth, getProductsController);

export default productRouter;
