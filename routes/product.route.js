import { Router } from "express";
import { auth } from "../middleware/auth.js";
import tempStorage from "../middleware/multer.js";
import {
  addProductController,
  addProductDataLoadController,
  editProductCategoryDataLoadController,
  getProductsByCategoryController,
  getProductsBySubcategoryController,
  getProductsController,
} from "../controllers/product.controller.js";

const productRouter = Router();

productRouter.post(
  "/add-product",
  auth,
  tempStorage.array("images"),
  addProductController
);
productRouter.post(
  "/add-product-dataload",
  tempStorage.array("images"),
  auth,
  addProductDataLoadController
);
productRouter.get("/get-products", getProductsController);
productRouter.get("/get-products-by-category", getProductsByCategoryController);
productRouter.get(
  "/get-products-by-subcategory",
  auth,
  getProductsBySubcategoryController
);
productRouter.put(
  "/edit-product-category-dataload",
  auth,
  editProductCategoryDataLoadController
);
export default productRouter;
