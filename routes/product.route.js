import { Router } from "express";
import { auth } from "../middleware/auth.js";
import tempStorage from "../middleware/multer.js";
import {
  addProductController,
  getProductsByCategoryController,
  getProductsController,
} from "../controllers/product.controller.js";

const productRouter = Router();

productRouter.post(
  "/add-product",
  auth,
  tempStorage.array("images"),
  addProductController
);
productRouter.get("/get-products", getProductsController);
productRouter.get("/get-products-by-category", getProductsByCategoryController);
export default productRouter;
