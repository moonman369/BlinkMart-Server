import { Router } from "express";
import { auth, adminAuth } from "../middleware/auth.js";
import tempStorage from "../middleware/multer.js";
import {
  addProductController,
  addProductDataLoadController,
  editProductCategoryDataLoadController,
  getProductsByCategoryController,
  getProductsBySubcategoryController,
  getProductsController,
  getProductByIdController,
} from "../controllers/product.controller.js";

const productRouter = Router();

productRouter.post(
  "/add-product",
  auth,
  adminAuth,
  tempStorage.array("images"),
  addProductController
);
productRouter.post(
  "/add-product-dataload",
  auth,
  adminAuth,
  tempStorage.array("images"),
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
  adminAuth,
  editProductCategoryDataLoadController
);
productRouter.get("/get-product", getProductByIdController);

export default productRouter;
