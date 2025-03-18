import { Router } from "express";
import { auth } from "../middleware/auth.js";
import tempStorage from "../middleware/multer.js";
import { addProductController } from "../controllers/product.controller.js";

const productRouter = Router();

productRouter.post(
  "/add-product",
  auth,
  tempStorage.single("image"),
  addProductController
);

export default productRouter;
