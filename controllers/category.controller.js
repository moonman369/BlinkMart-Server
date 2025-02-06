import e from "express";
import CategoryModel from "../models/category.model.js";
import { IMAGE_MIMETYPE_LIST } from "../utils/constants.js";
import { uploadImageToCloudinary } from "../utils/uploadImage.js";
import axios from "axios";
import { getSHA256 } from "../utils/computeHash.js";
import { get, isValidObjectId } from "mongoose";
import SubCategoryModel from "../models/sub_category.model.js";
import ProductModel from "../models/product.model.js";

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

export const getAllCategoriesController = async (request, response) => {
  try {
    console.log(request.query);
    const pageSize = Number(request.query.pageSize) || 10;
    const currentPage = Number(request.query.currentPage) || 1;
    const skip = pageSize * (currentPage - 1);
    const dbResponse = await CategoryModel.find().skip(skip).limit(pageSize);
    if (!dbResponse) {
      return response.status(404).json({
        errorMessage: "No categories found",
        success: false,
        timestamp: new Date().toISOString(),
      });
    }

    console.log("dbResponse", dbResponse);
    return response.status(200).json({
      message: "Categories fetched successfully",
      pageSize,
      currentPage: currentPage,
      data: dbResponse,
      success: true,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.log(error);
    console.error(error);
    return response.status(500).json({
      errorMessage: error.message,
      errorDetails: error,
      success: false,
      timestamp: new Date().toISOString(),
    });
  }
};

export const updateCategoryController = async (request, response) => {
  try {
    const { categoryId } = request.params;
    if (!isValidObjectId(categoryId)) {
      return response.status(400).json({
        errorMessage: "Invalid Category ID!",
        success: false,
        timestamp: new Date().toISOString(),
      });
    }

    const { name } = request.body;
    const image = request.file;
    if (!name && !image) {
      return response.status(400).json({
        errorMessage: "Category name and image missing!",
        success: false,
        timestamp: new Date().toISOString(),
      });
    }
    const category = await CategoryModel.findById(categoryId);
    const categoryUpdateObject = {
      name: category?.name,
      image: category?.image,
    };

    let nameUpdated = false;
    if (name) {
      if (name !== category?.name) {
        categoryUpdateObject.name = name;
        nameUpdated = true;
      }
    }

    let imageUpdated = false;
    if (image) {
      const requestImageHash = getSHA256(image?.buffer);
      const cloudinaryImageHash = getSHA256(
        (await axios.get(category?.image, { responseType: "arraybuffer" })).data
      );
      console.log(
        `newImageHash: ${requestImageHash}\ncloudinaryImageHash: ${cloudinaryImageHash}`
      );
      if (requestImageHash !== cloudinaryImageHash) {
        const uploadResponse = await uploadImageToCloudinary(image);
        console.log("Image Upload Response Cloudinary: \n", uploadResponse);
        categoryUpdateObject.image = uploadResponse?.url;
        imageUpdated = true;
      }
    }

    if (!nameUpdated && !imageUpdated) {
      return response.status(409).json({
        errorMessage: "New data identical to saved data",
        success: false,
        timestamp: new Date().toISOString(),
      });
    }

    const updateResponse = await CategoryModel.updateOne(
      { _id: categoryId },
      categoryUpdateObject
    );
    console.log("DB Update Response", updateResponse);
    return response.status(200).json({
      message: "Successfully updated category data",
      data: updateResponse,
      success: true,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error(error);
    return response.status(500).json({
      message: error.message,
      errorDetails: error,
      success: false,
      timestamp: new Date().toISOString(),
    });
  }
};

export const deleteCategoryrController = async (request, response) => {
  try {
    const { categoryId } = request.params;
    if (!isValidObjectId(categoryId)) {
      return response.status(400).json({
        errorMessage: "Invalid Category ID!",
        success: false,
        timestamp: new Date().toISOString(),
      });
    }

    const subCategoryCount = await SubCategoryModel.find({
      category: {
        $in: [categoryId],
      },
    }).countDocuments();

    const productCount = await ProductModel.find({
      category: {
        $in: [categoryId],
      },
    }).countDocuments();
    if (subCategoryCount > 0 || productCount > 0) {
      return response.status(409).json({
        errorMessage:
          "Cannot delete this category as it has listed sub-categories and products under it!",
        success: false,
        timestamp: new Date().toISOString(),
      });
    }

    const deleteResponse = await CategoryModel.deleteOne({ _id: categoryId });
    console.log("Delete Response", deleteResponse);

    if (deleteResponse?.deletedCount <= 0) {
      return response.status(404).json({
        errorMessage: "Category with given ID was not found!",
        success: false,
        timestamp: new Date().toISOString(),
      });
    }
    return response.status(204).json({
      message: "Successfully deleted category!",
      success: true,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error(error);
    return response.status(500).json({
      message: error.message,
      errorDetails: error,
      success: false,
      timestamp: new Date().toISOString(),
    });
  }
};
