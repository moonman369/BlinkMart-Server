import { Router } from "express";

import { auth, adminAuth } from "../middleware/auth.js";
import tempStorage from "../middleware/multer.js";
import {
  addSubcategoryController,
  deleteSubcategoryController,
  getAllSubcategoriesByCategoryController,
  getSubcategoriesController,
  updateSubcategoryByNameController,
  updateSubcategoryController,
} from "../controllers/subcategory.controller.js";

const subCategoryRouter = Router();

subCategoryRouter.post(
  "/add-subcategory",
  auth,
  adminAuth,
  tempStorage.single("image"),
  addSubcategoryController
);
subCategoryRouter.get(
  "/get-all-subcategories",
  auth,
  getSubcategoriesController
);
subCategoryRouter.get(
  "/get-subcategories-by-category",
  auth,
  getAllSubcategoriesByCategoryController
);
subCategoryRouter.put(
  "/update-subcategory/:subcategoryId",
  auth,
  adminAuth,
  tempStorage.single("image"),
  updateSubcategoryController
);
subCategoryRouter.put(
  "/update-subcategory-by-name",
  auth,
  adminAuth,
  tempStorage.single("image"),
  updateSubcategoryByNameController
);
subCategoryRouter.delete(
  "/delete-subcategory/:subcategoryId",
  auth,
  adminAuth,
  deleteSubcategoryController
);

export default subCategoryRouter;
