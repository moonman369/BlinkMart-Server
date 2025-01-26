import e from "express";
import CategoryModel from "../models/category.model.js";
import { IMAGE_MIMETYPE_LIST } from "../utils/constants.js";
import {
  uploadBase64ImageToCloudinary,
  uploadImageToCloudinary,
} from "../utils/uploadImage.js";

export const addCategoryController = async (request, response) => {
  try {
    const { name } = request.body;
    const image = request.file;
    // console.log("Image: ", image);
    // console.log(request.body["name"]);

    if (!name) {
      return response.status(400).json({
        errorMessage: "Missing required field `name`",
        success: false,
        timestamp: new Date().toISOString(),
      });
    }

    let uploadedImageUrl = "";
    if (image && image !== "" && image != null) {
      if (!IMAGE_MIMETYPE_LIST.includes(image?.mimetype)) {
        return response.status(400).json({
          errorMessage: `Invalid file format! Choose a format from this list: ['image/jpeg', 'image/png', 'image/gif', 'image/bmp', 'image/webp', 'image/tiff', 'image/svg+xml', 'image/x-icon', 'image/heif', 'image/heic']`,
          success: false,
          timestamp: new Date().toISOString(),
        });
      } else {
        const uploadResponse = await uploadImageToCloudinary(image);
        uploadedImageUrl = uploadResponse?.url;
        console.log("Image Upload Response Cloudinary: \n", uploadResponse);
      }
    }

    const newCategory = new CategoryModel({
      name,
      image: uploadedImageUrl,
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
      message: "Category added successfully",
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
