import jwt from "jsonwebtoken";
import UserModel from "../models/user.model.js";

const generateAccessToken = async (userId, role) => {
  const token = await jwt.sign(
    { id: userId, role: role },
    process.env["SERVER_TOKEN_ACCESS_SECRET_KEY"],
    {
      expiresIn: process.env["SERVER_TOKEN_ACCESS_TTL"],
    }
  );

  return token;
};

const generateRefreshToken = async (userId, role) => {
  const token = await jwt.sign(
    { id: userId, role: role },
    process.env["SERVER_TOKEN_REFRESH_SECRET_KEY"],
    {
      expiresIn: process.env["SERVER_TOKEN_REFRESH_TTL"],
    }
  );

  const updateDbResponse = await UserModel.updateOne(
    {
      _id: userId,
    },
    { refresh_token: token }
  );

  return token;
};

export default {
  generateAccessToken,
  generateRefreshToken,
};
