import UserModel from "../models/user.model.js";

export const registerUserController = async (request, response) => {
  try {
    const { name, email, password } = request.body;
    if (!name) {
      return response.status(400).json({
        errorMessage: "Missing required field `name`",
        success: false,
        timestamp: new Date().toISOString(),
      });
    }
    if (!email) {
      return response.status(400).json({
        errorMessage: "Missing required field `password`",
        success: false,
        timestamp: new Date().toISOString(),
      });
    }
    if (!name) {
      return response.status(400).json({
        errorMessage: "Missing required field `email`",
        success: false,
        timestamp: new Date().toISOString(),
      });
    }

    const user = await UserModel.findOne({ email });
  } catch (error) {
    return response.status(500).json({
      errorMessage: error.message,
      errorDetails: error,
      success: false,
      timestamp: new Date().toISOString(),
    });
  }
};
