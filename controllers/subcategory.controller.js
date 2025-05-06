import CategoryModel from "../models/category.model.js";
import { IMAGE_MIMETYPE_LIST } from "../utils/constants.js";
import { uploadImageToCloudinary } from "../utils/uploadImage.js";
import axios from "axios";
import { getSHA256 } from "../utils/computeHash.js";
import { isValidObjectId } from "mongoose";
import SubCategoryModel from "../models/sub_category.model.js";
import ProductModel from "../models/product.model.js";
import { request, response } from "express";

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

    const subCategory = await SubCategoryModel.find({ name: name });
    if (subCategory.length > 0) {
      return response.status(409).json({
        errorMessage: `Subcategory with this name already exists!`,
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
        errorMessage: "Failed to save subcategory to database",
        success: false,
        timestamp: new Date().toISOString(),
      });
    }

    return response.status(201).json({
      message: "Subcategory added successfully!",
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
    const { hasProducts } = request.query;
    if (request.query?.all) {
      let dbResponse = await SubCategoryModel.find()
        .sort({ createdAt: -1 })
        .populate("category");
      if (hasProducts) {
        dbResponse = dbResponse.filter(async (subcategory) => {
          (await ProductModel.find({
            subcategory: subcategory._id,
          }).countDocuments()) > 0;
        });
      }

      if (!dbResponse) {
        return response.status(404).json({
          errorMessage: "No subcategories found",
          success: false,
          timestamp: new Date().toISOString(),
        });
      }

      return response.status(200).json({
        message: "Subcategories fetched successfully",
        count: dbResponse.length,
        data: dbResponse,
        success: true,
        timestamp: new Date().toISOString(),
      });
    }
    const pageSize = Number(request.query.pageSize) || 10;
    const currentPage = Number(request.query.currentPage) || 1;
    const skip = pageSize * (currentPage - 1);
    const dbResponse = await SubCategoryModel.find()
      .skip(skip)
      .limit(pageSize)
      .sort({ createdAt: -1 })
      .populate("category");
    const totalRecordCount = await SubCategoryModel.countDocuments();
    if (!dbResponse) {
      return response.status(404).json({
        errorMessage: "No subcategories found",
        success: false,
        timestamp: new Date().toISOString(),
      });
    }

    return response.status(200).json({
      message: "Categories fetched successfully",
      pageSize,
      currentPage: currentPage,
      count: dbResponse.length,
      totalCount: totalRecordCount,
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

export const getAllSubcategoriesByCategoryController = async (
  request,
  response
) => {
  try {
    const categoryId = request.query?.categoryId;
    if (!categoryId) {
      return response.status(400).json({
        errorMessage: "Missing required parameter `categoryId`",
        success: false,
        timestamp: new Date().toISOString(),
      });
    }
    if (request.query?.all) {
      const dbResponse = await SubCategoryModel.find({ category: categoryId })
        .sort({ createdAt: -1 })
        .populate("category");
      if (!dbResponse) {
        return response.status(404).json({
          errorMessage: "No subcategories found",
          success: false,
          timestamp: new Date().toISOString(),
        });
      }

      return response.status(200).json({
        message: "Subcategories fetched successfully",
        count: dbResponse.length,
        data: dbResponse,
        success: true,
        timestamp: new Date().toISOString(),
      });
    }
    const pageSize = Number(request.query.pageSize) || 10;
    const currentPage = Number(request.query.currentPage) || 1;
    const skip = pageSize * (currentPage - 1);
    const dbResponse = await SubCategoryModel.find({ categoryId: categoryId })
      .skip(skip)
      .limit(pageSize)
      .sort({ createdAt: -1 })
      .populate("category");
    const totalRecordCount = await SubCategoryModel.countDocuments();
    if (!dbResponse) {
      return response.status(404).json({
        errorMessage: "No subcategories found",
        success: false,
        timestamp: new Date().toISOString(),
      });
    }

    return response.status(200).json({
      message: "Categories fetched successfully",
      pageSize,
      currentPage: currentPage,
      count: dbResponse.length,
      totalCount: totalRecordCount,
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

export const updateSubcategoryController = async (request, response) => {
  try {
    const { subcategoryId } = request.params;
    if (!subcategoryId) {
      return response.status(400).json({
        errorMessage: "Missing required field `id`",
        success: false,
        timestamp: new Date().toISOString(),
      });
    }
    if (!isValidObjectId(subcategoryId)) {
      return response.status(400).json({
        errorMessage: "Invalid Category ID!",
        success: false,
        timestamp: new Date().toISOString(),
      });
    }

    const { name, categories } = request.body;
    const image = request.file;
    if (!(name || categories || image)) {
      return response.status(400).json({
        errorMessage:
          "Atleast one of the following fields are required: `name`, `categories` or `image`",
        success: false,
        timestamp: new Date().toISOString(),
      });
    }

    const subcategory = await SubCategoryModel.findById(subcategoryId);
    if (!subcategory) {
      return response.status(404).json({
        errorMessage: "Subcategory not found",
        success: false,
        timestamp: new Date().toISOString(),
      });
    }

    let nameUpdated = false;
    if (name) {
      if (name !== subcategory?.name) {
        subcategory.name = name;
        nameUpdated = true;
      }
    }

    let categoriesUpdated = false;
    if (categories) {
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

      for (let i = 0; i < categoriesArray.length; i++) {
        if (!isValidObjectId(categoriesArray[i])) {
          return response.status(400).json({
            errorMessage: `Invalid Category ID: ${categoriesArray[i]}; At Position: ${i}`,
            success: false,
            timestamp: new Date().toISOString(),
          });
        }
      }

      if (categories !== JSON.stringify(subcategory.category)) {
        subcategory.category = categoriesArray;
        categoriesUpdated = true;
      }
    }

    let imageUpdated = false;
    if (image) {
      if (!IMAGE_MIMETYPE_LIST.includes(image?.mimetype)) {
        return response.status(400).json({
          errorMessage: `Invalid file format! Choose a format from this list: ['image/jpeg', 'image/png', 'image/gif', 'image/bmp', 'image/webp', 'image/tiff', 'image/svg+xml', 'image/x-icon', 'image/heif', 'image/heic']`,
          success: false,
          timestamp: new Date().toISOString(),
        });
      }

      const requestImageHash = getSHA256(image?.buffer);
      const cloudinaryImageHash = subcategory?.image
        ? getSHA256(
            (
              await axios.get(subcategory?.image, {
                responseType: "arraybuffer",
              })
            ).data
          )
        : "";
      console.log(
        `newImageHash: ${requestImageHash}\ncloudinaryImageHash: ${cloudinaryImageHash}`
      );
      if (requestImageHash !== cloudinaryImageHash) {
        const uploadResponse = await uploadImageToCloudinary(image);
        console.log("Image Upload Response Cloudinary: \n", uploadResponse);
        subcategory.image = uploadResponse?.url;
        imageUpdated = true;
      }
    }

    if (!nameUpdated && !categoriesUpdated && !imageUpdated) {
      return response.status(409).json({
        errorMessage: "New data identical to saved data",
        success: false,
        timestamp: new Date().toISOString(),
      });
    }

    await subcategory.save();

    return response.status(200).json({
      message: "Subcategory updated successfully",
      data: subcategory,
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

export const updateSubcategoryByNameController = async (request, response) => {
  try {
    const { originalName, name, categories } = request.body;
    if (!originalName) {
      return response.status(400).json({
        errorMessage: "Missing required field `originalName`",
        success: false,
        timestamp: new Date().toISOString(),
      });
    }
    const image = request.file;
    console.log(image);
    if (!(name || categories || image)) {
      return response.status(400).json({
        errorMessage:
          "Atleast one of the following fields are required: `name`, `categories` or `image`",
        success: false,
        timestamp: new Date().toISOString(),
      });
    }

    const subcategory = await SubCategoryModel.findOne({ name: originalName });
    if (!subcategory) {
      return response.status(404).json({
        errorMessage: "Subcategory with given name not found",
        success: false,
        timestamp: new Date().toISOString(),
      });
    }

    let nameUpdated = false;
    if (name) {
      if (name !== subcategory?.name) {
        subcategory.name = name;
        nameUpdated = true;
      }
    }

    let categoriesUpdated = false;
    if (categories) {
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

      for (let i = 0; i < categoriesArray.length; i++) {
        if (!isValidObjectId(categoriesArray[i])) {
          return response.status(400).json({
            errorMessage: `Invalid Category ID: ${categoriesArray[i]}; At Position: ${i}`,
            success: false,
            timestamp: new Date().toISOString(),
          });
        }
      }

      if (categories !== JSON.stringify(subcategory.category)) {
        subcategory.category = categoriesArray;
        categoriesUpdated = true;
      }
    }

    let imageUpdated = false;
    if (image) {
      if (!IMAGE_MIMETYPE_LIST.includes(image?.mimetype)) {
        return response.status(400).json({
          errorMessage: `Invalid file format! Choose a format from this list: ['image/jpeg', 'image/png', 'image/gif', 'image/bmp', 'image/webp', 'image/tiff', 'image/svg+xml', 'image/x-icon', 'image/heif', 'image/heic']`,
          success: false,
          timestamp: new Date().toISOString(),
        });
      }

      const requestImageHash = getSHA256(image?.buffer);
      const cloudinaryImageHash = subcategory?.image
        ? getSHA256(
            (
              await axios.get(subcategory?.image, {
                responseType: "arraybuffer",
              })
            ).data
          )
        : "";
      console.log(
        `newImageHash: ${requestImageHash}\ncloudinaryImageHash: ${cloudinaryImageHash}`
      );
      if (requestImageHash !== cloudinaryImageHash) {
        const uploadResponse = await uploadImageToCloudinary(image);
        console.log("Image Upload Response Cloudinary: \n", uploadResponse);
        subcategory.image = uploadResponse?.url;
        imageUpdated = true;
      }
    }

    if (!nameUpdated && !categoriesUpdated && !imageUpdated) {
      return response.status(409).json({
        errorMessage: "New data identical to saved data",
        success: false,
        timestamp: new Date().toISOString(),
      });
    }

    await subcategory.save();

    return response.status(200).json({
      message: "Subcategory updated successfully",
      data: subcategory,
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

export const deleteSubcategoryController = async (request, response) => {
  try {
    const { subcategoryId } = request.params;
    if (!subcategoryId) {
      return response.status(400).json({
        errorMessage: "Missing required field `id`",
        success: false,
        timestamp: new Date().toISOString(),
      });
    }
    if (!isValidObjectId(subcategoryId)) {
      return response.status(400).json({
        errorMessage: "Invalid Category ID!",
        success: false,
        timestamp: new Date().toISOString(),
      });
    }

    const subcategory = await SubCategoryModel.findById(subcategoryId);
    if (!subcategory) {
      return response.status(404).json({
        errorMessage: "Subcategory not found",
        success: false,
        timestamp: new Date().toISOString(),
      });
    }

    const products = await ProductModel.find({ subcategory: subcategoryId });
    if (products.length > 0) {
      return response.status(409).json({
        errorMessage:
          "Subcategory has products associated with it. Please delete the products first",
        success: false,
        timestamp: new Date().toISOString(),
      });
    }

    const dbResponse = await SubCategoryModel.deleteOne({ _id: subcategoryId });
    if (!dbResponse) {
      return response.status(500).json({
        errorMessage: "Failed to delete subcategory from database",
        success: false,
        timestamp: new Date().toISOString(),
      });
    }

    return response.status(200).json({
      message: "Subcategory deleted successfully",
      data: dbResponse,
      success: true,
      timestamp: new Date().toISOString(),
    });
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
