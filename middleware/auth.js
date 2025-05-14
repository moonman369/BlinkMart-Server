import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import UserModel from "../models/user.model.js";
dotenv.config();

export const auth = async (request, response, next) => {
  try {
    const accessToken =
      request?.cookies["accessToken"] ||
      request?.header?.authorization?.split(" ")[1];
    console.log(`Active accessToken: ${accessToken}`);
    if (!accessToken) {
      return response.status(401).json({
        errorMessage: `Unauthorized Access: No active access tokens found...`,
        success: false,
        timestamp: new Date().toISOString(),
      });
    }

    let decodedToken;
    try {
      decodedToken = await jwt.verify(
        accessToken,
        process.env["SERVER_TOKEN_ACCESS_SECRET_KEY"]
      );
    } catch (error) {
      return response.status(401).json({
        errorMessage: `Unauthorized Access: Token has expired`,
        success: false,
        timestamp: new Date().toISOString(),
      });
    }

    request.userId = decodedToken.id;
    next();
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

export const adminAuth = async (request, response, next) => {
  try {
    const userId = request.userId;
    const user = await UserModel.findById(userId);

    if (!user || user.role !== "ADMIN") {
      return response.status(403).json({
        errorMessage: "Access denied: Admin privileges required",
        success: false,
        timestamp: new Date().toISOString(),
      });
    }

    next();
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
