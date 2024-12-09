import bcryptjs from "bcryptjs";
import UserModel from "../models/user.model.js";
import sendEmail from "../config/sendEmail.js";
import getVerifyEmailTemplate from "../utils/verifyEmailTemplate.js";

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
    return response.status(500).json({
      errorMessage: error.message,
      errorDetails: error,
      success: false,
      timestamp: new Date().toISOString(),
    });
  }
};

export const verifyUserEmailController = async (request, response) => {
  try {
    const { verificationCode } = request.body;
    const user = UserModel.findOne({ _id: verificationCode });

    if (!user) {
      return response.status(400).json({
        errorMessage: "Invalid `verificationCode`",
        success: false,
        timestamp: new Date().toISOString(),
      });
    }

    const dbResponse = await UserModel.updateOne(
      { _id: code },
      { email_is_verified: true }
    );

    return response.status(200).json({
      message: "User email has been verified successfully",
      success: true,
      userData: {
        email: dbResponse.email,
        username: dbResponse.username,
      },
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

//Login Controller
export const loginUserController = async (request, response) => {
  try {
    const { email, password } = request.body;
    const user = await UserModel.findOne({ email });

    if (!user) {
      return response.status(400).json({
        errorMessage: `User with email: "${email}, does not exist!"`,
        success: false,
        timestamp: new Date().toISOString(),
      });
    }

    if (user.status !== "Active") {
      return response.status(403).json({
        errorMessage: `User status is currently ${user.status}. Please contact Admin to activate user..."`,
        success: false,
        timestamp: new Date().toISOString(),
      });
    }

    const passwordIsCorrect = await bcryptjs.compare(password, user.password);
    if (!passwordIsCorrect) {
      return response.status(401).json({
        errorMessage: `Incorrect Password!"`,
        success: false,
        timestamp: new Date().toISOString(),
      });
    }
  } catch (error) {
    return response.status(500).json({
      errorMessage: error.message,
      errorDetails: error,
      success: false,
      timestamp: new Date().toISOString(),
    });
  }
};
