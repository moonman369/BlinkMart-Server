import CategoryModel from "../models/category.model.js";
import { IMAGE_MIMETYPE_LIST } from "../utils/constants.js";
import { uploadImageToCloudinary } from "../utils/uploadImage.js";
import axios from "axios";
import { getSHA256 } from "../utils/computeHash.js";
import { isValidObjectId } from "mongoose";
import SubCategoryModel from "../models/sub_category.model.js";
import ProductModel from "../models/product.model.js";

export const addSubcategoryController = async (request, response) => {
  try {
    const { name, categories } = request.body;
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

    if (!categories) {
      return response.status(400).json({
        errorMessage: "Missing required field `categories`",
        success: false,
        timestamp: new Date().toISOString(),
      });
    }

    const categoriesArray = JSON.parse(categories);
    if (!Array.isArray(categoriesArray)) {
      return response.status(400).json({
        errorMessage: "Categories must be an array",
        success: false,
        timestamp: new Date().toISOString(),
      });
    }

    if (categoriesArray.length === 0) {
      return response.status(400).json({
        errorMessage: "Categories cannot be empty",
        success: false,
        timestamp: new Date().toISOString(),
      });
    }

    // console.log("categories", categoriesArray);
    for (let i = 0; i < categoriesArray.length; i++) {
      if (!isValidObjectId(categoriesArray[i])) {
        return response.status(400).json({
          errorMessage: `Invalid Category ID: ${categoriesArray[i]}; At Position: ${i}`,
          success: false,
          timestamp: new Date().toISOString(),
        });
      }
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

    const newSubcategory = new SubCategoryModel({
      name,
      category: categoriesArray,
      image: uploadedImageUrl,
    });
    const dbResponse = await newSubcategory.save();
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
      data: newSubcategory,
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

export const getSubcategoriesController = async (request, response) => {
  try {
    const dbResponse = await SubCategoryModel.find({}).populate("category");
    if (!dbResponse) {
      return response.status(404).json({
        errorMessage: "No subcategories found",
        success: false,
        timestamp: new Date().toISOString(),
      });
    }

    return response.status(200).json({
      data: dbResponse,
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
