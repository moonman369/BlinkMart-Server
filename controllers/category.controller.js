import e from "express";
import CategoryModel from "../models/category.model.js";
import { IMAGE_MIMETYPE_LIST } from "../utils/constants.js";
import { uploadBase64ImageToCloudinary } from "../utils/uploadImage.js";

export const addCategoryController = async (request, response) => {
  try {
    const { name, image } = request.body;

    if (!name) {
      return response.status(400).json({
        errorMessage: "Missing required field `name`",
        success: false,
        timestamp: new Date().toISOString(),
      });
    }
    if (!image) {
      return response.status(400).json({
        errorMessage: "Missing required field `image`",
        success: false,
        timestamp: new Date().toISOString(),
      });
    }
    if (!image.startsWith("data:image")) {
      return response.status(400).json({
        errorMessage: `Invalid file format! Choose a format from this list: ['image/jpeg', 'image/png', 'image/gif', 'image/bmp', 'image/webp', 'image/tiff', 'image/svg+xml', 'image/x-icon', 'image/heif', 'image/heic']`,
        success: false,
        timestamp: new Date().toISOString(),
      });
    }
    const uploadResponse = await uploadBase64ImageToCloudinary(image);
    console.log("Image Upload Response Cloudinary: \n", uploadResponse);

    const newCategory = new CategoryModel({
      name,
      image: uploadResponse.url,
    });
    const dbResponse = await newCategory.save();
    console.log("dbResponse", dbResponse);
    if (!dbResponse) {
      return response.status(500).json({
        errorMessage: "Failed to save category to database",
        success: false,
        timestamp: new Date().toISOString(),
      });
    }

    return response.status(201).json({
      data: newCategory,
      success: true,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.log(error);
    return response.status(500).json({
      errorMessage: error.message,
      errorDetails: error,
      success: false,
      timestamp: new Date().toISOString(),
    });
  }
};
