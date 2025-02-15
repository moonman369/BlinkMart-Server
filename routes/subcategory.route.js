import { Router } from "express";

import { auth } from "../middleware/auth.js";
import tempStorage from "../middleware/multer.js";
import { addSubcategoryController } from "../controllers/subcategory.controller.js";

const subCategoryRouter = Router();

subCategoryRouter.post(
  "/add-subcategory",
  auth,
  tempStorage.single("image"),
  addSubcategoryController
);

export default subCategoryRouter;
