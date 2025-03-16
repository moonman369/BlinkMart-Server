import jwt from "jsonwebtoken";
import UserModel from "../models/user.model.js";

const generateAccessToken = async (userId, role) => {
  const token = await jwt.sign(
    { id: userId, role: role },
    process.env["SERVER.TOKEN.ACCESS.SECRET_KEY"],
    {
      expiresIn: process.env["SERVER.TOKEN.ACCESS.TTL"],
    }
  );

  return token;
};

const generateRefreshToken = async (userId, role) => {
  const token = await jwt.sign(
    { id: userId, role: role },
    process.env["SERVER.TOKEN.REFRESH.SECRET_KEY"],
    {
      expiresIn: process.env["SERVER.TOKEN.REFRESH.TTL"],
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
