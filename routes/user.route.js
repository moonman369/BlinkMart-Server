import { Router } from "express";
import {
  forgotPasswordController,
  getUserDetails,
  loginUserController,
  logoutUserController,
  refreshTokenController,
  registerUserController,
  resetPasswordController,
  setUserAvatarController,
  updateUserDetailsController,
  verifyForgotPasswordOtp,
  verifyUserEmailController,
} from "../controllers/user.controller.js";
import { auth } from "../middleware/auth.js";
import tempStorage from "../middleware/multer.js";

const userRouter = Router();

userRouter.post("/register", registerUserController);
userRouter.post("/verify-email", verifyUserEmailController);
userRouter.post("/login", loginUserController);
userRouter.get("/get-details", auth, getUserDetails);
userRouter.get("/logout", auth, logoutUserController);
userRouter.put(
  "/set-avatar",
  auth,
  tempStorage.single("avatar"),
  setUserAvatarController
);
userRouter.put("/update-details", auth, updateUserDetailsController);
userRouter.post("/forgot-password", forgotPasswordController);
userRouter.post("/verify-forgot-password-otp", verifyForgotPasswordOtp);
userRouter.put("/reset-password", resetPasswordController);
userRouter.post("/refresh-token", refreshTokenController);

export default userRouter;
