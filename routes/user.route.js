import { Router } from "express";
import {
  loginUserController,
  logoutUserController,
  registerUserController,
  verifyUserEmailController,
} from "../controllers/user.controller.js";
import { auth } from "../middleware/auth.js";

const userRouter = Router();

userRouter.post("/register", registerUserController);
userRouter.post("/verify-email", verifyUserEmailController);
userRouter.post("/login", loginUserController);
userRouter.get("/logout", auth, logoutUserController);

export default userRouter;
