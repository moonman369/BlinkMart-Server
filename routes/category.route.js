import { Router } from "express";
import {
  addCategoryController,
  deleteCategoryrController,
  getAllCategoriesController,
  updateCategoryController,
} from "../controllers/category.controller.js";
import { auth } from "../middleware/auth.js";
import tempStorage from "../middleware/multer.js";

const categoryRouter = Router();

categoryRouter.post(
  "/add-category",
  auth,
  tempStorage.single("image"),
  addCategoryController
);
categoryRouter.get("/get-all-categories", auth, getAllCategoriesController);
categoryRouter.put(
  "/update-category/:categoryId",
  auth,
  tempStorage.single("image"),
  updateCategoryController
);
categoryRouter.delete(
  "/delete-category/:categoryId",
  auth,
  deleteCategoryrController
);

export default categoryRouter;
