import { Router } from "express";
import {
  addCategoryController,
  getAllCategoriesController,
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

export default categoryRouter;
