import { Router } from "express";
import { addCategoryController } from "../controllers/category.controller.js";
import { auth } from "../middleware/auth.js";

const categoryRouter = Router();

categoryRouter.post("/add-category", auth, addCategoryController);

export default categoryRouter;
