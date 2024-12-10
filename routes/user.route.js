import { Router } from "express";
import {
  loginUserController,
  registerUserController,
  verifyUserEmailController,
} from "../controllers/user.controller.js";

const userRouter = Router();

userRouter.post("/register", registerUserController);
userRouter.post("/verify-email", verifyUserEmailController);
userRouter.post("/login", loginUserController);

export default userRouter;
