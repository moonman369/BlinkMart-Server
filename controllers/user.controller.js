import bcryptjs from "bcryptjs";
import UserModel from "../models/user.model.js";
import sendEmail from "../config/sendEmail.js";
import getVerifyEmailTemplate from "../utils/verifyEmailTemplate.js";
import generateTokens from "../utils/generateTokens.js";
import { isValidObjectId } from "mongoose";
import uploadImageToCloudinary from "../utils/uploadImage.js";
import { IMAGE_MIMETYPE_LIST } from "../utils/constants.js";

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

    const cookiesOption = {
      httpOnly: true,
      secure: true,
      sameSite: "None",
    };
    response.cookie("accessToken", accessToken, cookiesOption);
    response.cookie("refreshToken", refreshToken, cookiesOption);

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
