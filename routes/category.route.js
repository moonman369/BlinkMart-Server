import { Router } from "express";
import {
  addCategoryController,
  deleteCategoryController,
  getAllCategoriesController,
  updateCategoryController,
} from "../controllers/category.controller.js";
import { auth, adminAuth } from "../middleware/auth.js";
import tempStorage from "../middleware/multer.js";

const categoryRouter = Router();

categoryRouter.post(
  "/add-category",
  auth,
  adminAuth,
  tempStorage.single("image"),
  addCategoryController
);
categoryRouter.get("/get-all-categories", getAllCategoriesController);
categoryRouter.put(
  "/update-category/:categoryId",
  auth,
  adminAuth,
  tempStorage.single("image"),
  updateCategoryController
);
categoryRouter.delete(
  "/delete-category/:categoryId",
  auth,
  adminAuth,
  deleteCategoryController
);

export default categoryRouter;
