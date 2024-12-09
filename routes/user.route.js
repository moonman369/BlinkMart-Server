import { Router } from "express";
import {
  registerUserController,
  verifyUserEmailController,
} from "../controllers/user.controller.js";

const userRouter = Router();

userRouter.post("/register", registerUserController);
userRouter.post("/verify-email", verifyUserEmailController);

export default userRouter;
