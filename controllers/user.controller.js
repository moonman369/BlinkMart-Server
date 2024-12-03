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
