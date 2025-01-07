import bcryptjs from "bcryptjs";
import UserModel from "../models/user.model.js";
import sendEmail from "../config/sendEmail.js";
import {
  getVerifyEmailTemplate,
  getForgotPasswordEmailTemplate,
} from "../utils/emailTemplates.js";
import generateTokens from "../utils/generateTokens.js";
import { isValidObjectId } from "mongoose";
import uploadImageToCloudinary from "../utils/uploadImage.js";
import {
  COOKIE_OPTIONS,
  IMAGE_MIMETYPE_LIST,
  MINUTES_TO_MILLIS,
} from "../utils/constants.js";
import { generateOtp } from "../utils/generateOtp.js";
import jwt from "jsonwebtoken";

// Register User Controller
export const registerUserController = async (request, response) => {
  try {
    const { username, email, password } = request.body;
    if (!username) {
      return response.status(400).json({
        errorMessage: "Missing required field `username`",
        success: false,
        timestamp: new Date().toISOString(),
      });
    }
    if (!password) {
      return response.status(400).json({
        errorMessage: "Missing required field `password`",
        success: false,
        timestamp: new Date().toISOString(),
      });
    }
    if (!email) {
      return response.status(400).json({
        errorMessage: "Missing required field `email`",
        success: false,
        timestamp: new Date().toISOString(),
      });
    }
    console.log("show me going");

    const user = await UserModel.findOne({ email });
    console.log(user);
    if (user) {
      return response.status(409).json({
        errorMessage: "User with this email already exists",
        success: "false",
        timestamp: new Date().toISOString(),
      });
    }

    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(password, salt);
    console.log(hashedPassword);

    const newUser = new UserModel({
      username,
      email,
      password: hashedPassword,
    });
    const dbResponse = await newUser.save();
    console.log(dbResponse);
    const emailVerificationResponse = await sendEmail({
      to: email,
      subject: "Verify email from BlinkMart",
      htmlBody: getVerifyEmailTemplate({
        username,
        redirectUrl: `${process.env["FRONTEND.ORIGIN"]}/verify-email?code=${dbResponse._id}`,
      }),
    });

    return response.status(201).json({
      message: "User has been registered successfully!!",
      success: true,
      userData: {
        email: dbResponse.email,
        username: dbResponse.username,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error(error);
    return response.status(500).json({
      errorMessage: error.message,
      errorDetails: error,
      success: false,
      timestamp: new Date().toISOString(),
    });
  }
};

// Verify Email Controller
export const verifyUserEmailController = async (request, response) => {
  try {
    const { verificationCode } = request.body;
    if (!isValidObjectId(verificationCode)) {
      return response.status(400).json({
        errorMessage: "Invalid `verificationCode`",
        success: false,
        timestamp: new Date().toISOString(),
      });
    }

    const { email_is_verified, email, username } = await UserModel.findById(
      verificationCode
    );
    if (email_is_verified) {
      return response.status(400).json({
        errorMessage: "Email is already verified",
        success: false,
        timestamp: new Date().toISOString(),
      });
    }
    const dbResponse = await UserModel.updateOne(
      { _id: verificationCode },
      { email_is_verified: true }
    );
    console.log(dbResponse);
    return response.status(200).json({
      message: "User email has been verified successfully",
      success: true,
      userData: {
        email: email,
        username: username,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error(error);
    return response.status(500).json({
      errorMessage: error.message,
      errorDetails: error,
      success: false,
      timestamp: new Date().toISOString(),
    });
  }
};

//Login Controller
export const loginUserController = async (request, response) => {
  try {
    const { email, password } = request.body;

    if (!email) {
      return response.status(400).json({
        errorMessage: `Please provide email!`,
        success: false,
        timestamp: new Date().toISOString(),
      });
    }
    if (!password) {
      return response.status(400).json({
        errorMessage: `Please provide password!`,
        success: false,
        timestamp: new Date().toISOString(),
      });
    }

    const user = await UserModel.findOne({ email });
    if (!user) {
      return response.status(404).json({
        errorMessage: `User with email: '${email}', does not exist!`,
        success: false,
        timestamp: new Date().toISOString(),
      });
    }

    if (user.status !== "Active") {
      return response.status(403).json({
        errorMessage: `User status is currently ${user.status}. Please contact Admin to activate user...`,
        success: false,
        timestamp: new Date().toISOString(),
      });
    }

    const passwordIsCorrect = await bcryptjs.compare(password, user.password);
    if (!passwordIsCorrect) {
      return response.status(401).json({
        errorMessage: `Incorrect Password!`,
        success: false,
        timestamp: new Date().toISOString(),
      });
    }

    const accessToken = await generateTokens.generateAccessToken(
      user._id,
      user.role
    );
    const refreshToken = await generateTokens.generateRefreshToken(
      user._id,
      user.role
    );

    response.cookie("accessToken", accessToken, COOKIE_OPTIONS);
    response.cookie("refreshToken", refreshToken, COOKIE_OPTIONS);

    return response.status(200).json({
      message: "Login successful!",
      success: true,
      userData: {
        email: user.email,
        username: user.username,
      },
      tokens: {
        access: accessToken,
        refresh: refreshToken,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error(error);
    return response.status(500).json({
      errorMessage: error.message,
      errorDetails: error,
      success: false,
      timestamp: new Date().toISOString(),
    });
  }
};

// Get User Details Controller
export const getUserDetails = async (request, response) => {
  try {
    const userId = request.userId;
    const maskedUser = await UserModel.findById(userId).select(
      "-password -refresh_token -wuehdjs"
    );

    if (!maskedUser) {
      return response.status(404).json({
        errorMessage: `No user was found!`,
        success: false,
        timestamp: new Date().toISOString(),
      });
    }

    // const { password, ...maskedUserDetails } = user.;

    return response.status(200).json({
      message: "Successfully fetched user details!",
      data: maskedUser,
      success: true,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error(error);
    return response.status(500).json({
      errorMessage: error.message,
      errorDetails: error,
      success: false,
      timestamp: new Date().toISOString(),
    });
  }
};

// Logout Controller
export const logoutUserController = async (request, response) => {
  try {
    const userId = request.userId;
    if (!isValidObjectId(userId)) {
      return response.status(401).json({
        errorMessage: `Unauthorized Access: Token is invalid`,
        success: false,
        timestamp: new Date().toISOString(),
      });
    }

    const cookiesOption = {
      httpOnly: true,
      secure: true,
      sameSite: "None",
    };
    response.clearCookie("accessToken", cookiesOption);
    response.clearCookie("refreshToken", cookiesOption);

    const updateDbResponse = await UserModel.findByIdAndUpdate(userId, {
      refresh_token: "",
    });
    console.log("[DB Update Response]: ", updateDbResponse);

    return response.json({
      message: "Logout successful!",
      success: true,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error(error);
    return response.status(500).json({
      errorMessage: error.message,
      errorDetails: error,
      success: false,
      timestamp: new Date().toISOString(),
    });
  }
};

//Set User Avatar Controller
export const setUserAvatarController = async (request, response) => {
  try {
    const image = request.file;
    const userId = request.userId;
    if (!image) {
      return response.status(400).json({
        errorMessage: `Image file not found`,
        success: false,
        timestamp: new Date().toISOString(),
      });
    }
    console.log(`image: `, image);
    if (!IMAGE_MIMETYPE_LIST.includes(image?.mimetype)) {
      return response.status(400).json({
        errorMessage: `Invalid file format! Choose a format from this list: ['image/jpeg', 'image/png', 'image/gif', 'image/bmp', 'image/webp', 'image/tiff', 'image/svg+xml', 'image/x-icon', 'image/heif', 'image/heic']`,
        success: false,
        timestamp: new Date().toISOString(),
      });
    }
    const uploadResponse = await uploadImageToCloudinary(image);

    if (!isValidObjectId(userId)) {
      return response.status(401).json({
        errorMessage: `Invalid userId!`,
        success: false,
        timestamp: new Date().toISOString(),
      });
    }

    console.log("Image Upload Response Cloudinary: \n", uploadResponse);
    const updateDbResponse = await UserModel.findByIdAndUpdate(userId, {
      avatar: uploadResponse.url,
    });

    return response.status(200).json({
      message: "Successfully set avatar",
      userId: userId,
      avatarUrl: uploadResponse.url,
      success: true,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return response.status(500).json({
      errorMessage: error.message,
      errorDetails: error,
      success: false,
      timestamp: new Date().toISOString(),
    });
  }
};

// Update User Details Controller
export const updateUserDetailsController = async (request, response) => {
  try {
    const userId = request.userId; // from auth middleware
    const { username, email, password, mobile } = request.body;

    let hashedPassword = "";

    if (password) {
      const salt = await bcryptjs.genSalt(10);
      hashedPassword = await bcryptjs.hash(password, salt);
    }

    const updateDbResponse = await UserModel.updateOne(
      { _id: userId },
      {
        ...(username && { username: username }),
        ...(email && { email: email }),
        ...(password && { password: hashedPassword }),
        ...(mobile && { mobile: mobile }),
      }
    );
    console.log("Update DB response: \n", updateDbResponse);

    response.status(200).json({
      message: "Updated user successfully!",
      userId: userId,
      success: true,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error(error);
    return response.status(500).json({
      errorMessage: error.message,
      errorDetails: error,
      success: false,
      timestamp: new Date().toISOString(),
    });
  }
};

// Forgot Password Controller
export const forgotPasswordController = async (request, response) => {
  try {
    const { email } = request.body;
    if (!email) {
      return response.status(400).json({
        errorMessage: `Required field 'email' was not provided`,
        success: false,
        timestamp: new Date().toISOString(),
      });
    }

    const user = await UserModel.findOne({ email });
    if (!user) {
      return response.status(404).json({
        errorMessage: `User with this email was not found`,
        success: false,
        timestamp: new Date().toISOString(),
      });
    }

    const otp = generateOtp();
    const otpValidityDurationInMinutes =
      process.env["SERVER.OTP.EXPIRY_IN_MIN"] || 10;
    const otpValidityDurationInMillis =
      otpValidityDurationInMinutes * MINUTES_TO_MILLIS;
    const otpExpiryTime = new Date(
      new Date().getTime() + otpValidityDurationInMillis
    );

    const updateDbResponse = await UserModel.findByIdAndUpdate(user._id, {
      forgot_password_otp: otp,
      forgot_password_expiry: new Date(otpExpiryTime).toISOString(),
    });

    const resendResponse = await sendEmail({
      from: "",
      to: email,
      subject: "One Time Password for changing BlinkMart account password",
      htmlBody: getForgotPasswordEmailTemplate({
        username: user.username,
        otp,
        otpValidityDurationInMinutes,
      }),
    });

    return response.status(200).json({
      message: "OTP generated and sent to mail",
      userId: user._id,
      success: true,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return response.status(500).json({
      errorMessage: error.message,
      errorDetails: error,
      success: false,
      timestamp: new Date().toISOString(),
    });
  }
};

// Verify Forgot Password OTP
export const verifyForgotPasswordOtp = async (request, response) => {
  try {
    const { email, otp } = request.body;
    if (!email) {
      return response.status(400).json({
        errorMessage: `Required field 'email' was not provided`,
        success: false,
        timestamp: new Date().toISOString(),
      });
    }
    if (!otp) {
      return response.status(400).json({
        errorMessage: `Required field 'otp' was not provided`,
        success: false,
        timestamp: new Date().toISOString(),
      });
    }

    const user = await UserModel.findOne({ email });
    if (!user) {
      return response.status(404).json({
        errorMessage: `User with this email was not found`,
        success: false,
        timestamp: new Date().toISOString(),
      });
    }

    console.log(
      new Date().toISOString(),
      new Date(user.forgot_password_expiry).toISOString()
    );
    if (
      new Date().toISOString() >
      new Date(user.forgot_password_expiry).toISOString()
    ) {
      return response.status(401).json({
        errorMessage: `OTP has expired!`,
        success: false,
        timestamp: new Date().toISOString(),
      });
    }

    if (otp !== user.forgot_password_otp) {
      return response.status(401).json({
        errorMessage: `Invalid OTP!`,
        success: false,
        timestamp: new Date().toISOString(),
      });
    }

    return response.status(200).json({
      message: `OTP has been successfully validated!!`,
      success: true,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error(error);
    return response.status(500).json({
      errorMessage: error.message,
      errorDetails: error,
      success: false,
      timestamp: new Date().toISOString(),
    });
  }
};

// Reset Password Controller
export const resetPasswordController = async (request, response) => {
  try {
    const { email, newPassword, confirmNewPassword } = request.body;
    if (!email) {
      return response.status(400).json({
        errorMessage: `Required field 'email' was not provided`,
        success: false,
        timestamp: new Date().toISOString(),
      });
    }
    if (!newPassword) {
      return response.status(400).json({
        errorMessage: `Required field 'newPassword' was not provided`,
        success: false,
        timestamp: new Date().toISOString(),
      });
    }
    if (!confirmNewPassword) {
      return response.status(400).json({
        errorMessage: `Required field 'confirmNewPassword' was not provided`,
        success: false,
        timestamp: new Date().toISOString(),
      });
    }

    if (newPassword !== confirmNewPassword) {
      return response.status(401).json({
        errorMessage: `'newPassord' and 'confirmNewPassword' values do not match!`,
        success: false,
        timestamp: new Date().toISOString(),
      });
    }

    const user = await UserModel.findOne({ email });
    if (!user) {
      return response.status(404).json({
        errorMessage: `User with this email was not found`,
        success: false,
        timestamp: new Date().toISOString(),
      });
    }

    const salt = await bcryptjs.genSalt(10);
    const hashedNewPassword = await bcryptjs.hash(newPassword, salt);
    const updateDbResponse = await UserModel.updateOne(
      { _id: user._id },
      {
        password: hashedNewPassword,
      }
    );
    console.log("Update Password response", updateDbResponse);
    return response.status(200).json({
      message: `Password has been successfully updated!!`,
      success: true,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error(error);
    return response.status(500).json({
      errorMessage: error.message,
      errorDetails: error,
      success: false,
      timestamp: new Date().toISOString(),
    });
  }
};

// Refresh Token Controller
export const refreshTokenController = async (request, response) => {
  try {
    const refreshToken =
      request.cookies?.refreshToken ||
      request.header?.authorization?.split(" ")[1];
    if (!refreshToken) {
      return response.status(401).json({
        errorMessage: `Unauthorized Access: No Refresh token found`,
        success: false,
        timestamp: new Date().toISOString(),
      });
    }
    console.log(refreshToken);

    const verifyToken = jwt.verify(
      refreshToken,
      process.env["SERVER.TOKEN.REFRESH.SECRET_KEY"]
    );
    if (!verifyToken) {
      return response.status(401).json({
        errorMessage: `Unauthorized Access: Refresh token has expired`,
        success: false,
        timestamp: new Date().toISOString(),
      });
    }
    console.log(verifyToken);
    const { id, role } = verifyToken;
    const newAccessToken = await generateTokens.generateAccessToken(id, role);
    response.cookie("accessToken", newAccessToken, COOKIE_OPTIONS);
    return response.status(200).json({
      message: `New access token has been generated!!`,
      tokens: {
        accessToken: newAccessToken,
      },
      success: true,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error(error);
    return response.status(500).json({
      errorMessage: error.message,
      errorDetails: error,
      success: false,
      timestamp: new Date().toISOString(),
    });
  }
};
