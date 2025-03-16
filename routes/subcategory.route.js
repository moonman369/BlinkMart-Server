import { Router } from "express";

import { auth } from "../middleware/auth.js";
import tempStorage from "../middleware/multer.js";
import {
  addSubcategoryController,
  deleteSubcategoryController,
  getSubcategoriesController,
  updateSubcategoryController,
} from "../controllers/subcategory.controller.js";

const subCategoryRouter = Router();

subCategoryRouter.post(
  "/add-subcategory",
  auth,
  tempStorage.single("image"),
  addSubcategoryController
);
subCategoryRouter.get(
  "/get-all-subcategories",
  auth,
  getSubcategoriesController
);
subCategoryRouter.put(
  "/update-subcategory/:subcategoryId",
  auth,
  tempStorage.single("image"),
  updateSubcategoryController
);
subCategoryRouter.delete(
  "/delete-subcategory/:subcategoryId",
  auth,
  deleteSubcategoryController
);

export default subCategoryRouter;
