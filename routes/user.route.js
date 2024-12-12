import { Router } from "express";
import {
  loginUserController,
  logoutUserController,
  registerUserController,
  setUserAvatarController,
  updateUserDetailsController,
  verifyUserEmailController,
} from "../controllers/user.controller.js";
import { auth } from "../middleware/auth.js";
import tempStorage from "../middleware/multer.js";

const userRouter = Router();

userRouter.post("/register", registerUserController);
userRouter.post("/verify-email", verifyUserEmailController);
userRouter.post("/login", loginUserController);
userRouter.get("/logout", auth, logoutUserController);
userRouter.put(
  "/set-avatar",
  auth,
  tempStorage.single("avatar"),
  setUserAvatarController
);
userRouter.put("/update-details", auth, updateUserDetailsController);

export default userRouter;
