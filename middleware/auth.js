import jwt from "jsonwebtoken";
import dotenv from "dotenv";
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

    const decodedToken = await jwt.verify(
      accessToken,
      process.env["SERVER.TOKEN.ACCESS.SECRET_KEY"]
    );
    console.log(`Decoded JWT Token: ${decodedToken}`);
    if (!decodedToken) {
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
