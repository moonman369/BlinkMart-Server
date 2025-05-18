import { request, response } from "express";
import ProductModel from "../models/product.model.js";
import { IMAGE_MIMETYPE_LIST } from "../utils/constants.js";
import { uploadImageToCloudinary } from "../utils/uploadImage.js";
import { query } from "express";
import CategoryModel from "../models/category.model.js";
import SubCategoryModel from "../models/sub_category.model.js";
import { isValidObjectId } from "mongoose";

export const addProductController = async (request, response) => {
  try {
    const {
      name,
      categories,
      subcategories,
      unit,
      stock,
      price,
      discount,
      description,
      more_details,
      publish,
    } = request.body;
    const images = request?.files;

    if (
      !name ||
      !images ||
      !categories ||
      !subcategories ||
      !unit ||
      !stock ||
      !price ||
      !description
    ) {
      console.log("Images: ", request["files"]);
      const missingErrorString = "";
      Object.keys(request.body).forEach((key) => {
        if (!request.body[key]) {
          console.error(`Missing required field: ${key}`);
          missingErrorString += `Missing required field: ${key}`;
        }
      });
      if (!request?.files) {
        console.error("Missing required field: images");
        missingErrorString += ", Missing required field: images";
      }
      return response.status(400).json({
        errorMessage:
          "Missing one or more required fields: [name, image, categories, subcategories, unit, stock, price, description]\n`Missing required field: ${key}`",
        success: false,
        timestamp: new Date().toISOString(),
      });
    }

    if (!Array.isArray(images) || images.length === 0) {
      return response.status(400).json({
        errorMessage: "Field `image` should be an non-empty array",
        success: false,
        timestamp: new Date().toISOString(),
      });
    }

    const product = await ProductModel.find({ name: name });
    if (product.length > 0) {
      return response.status(409).json({
        errorMessage: `Product with this name already exists!`,
        success: false,
        timestamp: new Date().toISOString(),
      });
    }

    let imageUrlsArray = [];
    for (let image of images) {
      try {
        if (image && image !== "" && image != null) {
          if (!IMAGE_MIMETYPE_LIST.includes(image?.mimetype)) {
            console.error(
              `Invalid file format ${image?.mimetype} at index ${index}! Choose a format from this list: ['image/jpeg', 'image/png', 'image/gif', 'image/bmp', 'image/webp', 'image/tiff', 'image/svg+xml', 'image/x-icon', 'image/heif', 'image/heic']`
            );
            continue;
          }
          const uploadResponse = await uploadImageToCloudinary(image);
          console.log("Image Upload Response Cloudinary: \n", uploadResponse);
          imageUrlsArray.push(uploadResponse?.url);
        }
      } catch (error) {
        console.error("Error uploading image to Cloudinary: ", error);
        continue;
      }
    }
    // const imageUrlsArray = images.map(async (image, index) => {

    // });

    const categoriesArray = JSON.parse(categories);
    if (!Array.isArray(categoriesArray) || categoriesArray.length === 0) {
      return response.status(400).json({
        errorMessage: "Field `categories` should be an non-empty array",
        success: false,
        timestamp: new Date().toISOString(),
      });
    }

    const subcategoriesArray = JSON.parse(subcategories);
    if (!Array.isArray(subcategoriesArray) || subcategoriesArray.length === 0) {
      return response.status(400).json({
        errorMessage: "Field `subcategories` should be an non-empty array",
        success: false,
        timestamp: new Date().toISOString(),
      });
    }

    const moreDetailsObject = JSON.parse(more_details);

    const newProduct = new ProductModel({
      name,
      image: imageUrlsArray,
      category_id: categoriesArray,
      sub_category_id: subcategoriesArray,
      unit,
      stock,
      price,
      discount,
      description,
      more_details: moreDetailsObject,
      publish: publish || true,
    });
    const savedProduct = await newProduct.save();
    console.log("Saved Product: ", savedProduct);

    return response.status(201).json({
      success: true,
      message: "Product added successfully",
      product: savedProduct,
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

export const addProductDataLoadController = async (request, response) => {
  try {
    const {
      name,
      categories,
      subcategories,
      unit,
      stock,
      price,
      discount,
      description,
      more_details,
      publish,
    } = request.body;
    const images = request?.files;

    if (
      !name ||
      !images ||
      !categories ||
      !subcategories ||
      !unit ||
      !stock ||
      !price ||
      !description
    ) {
      console.log("Images: ", request["files"]);
      const missingErrorString = "";
      Object.keys(request.body).forEach((key) => {
        if (!request.body[key]) {
          console.error(`Missing required field: ${key}`);
          missingErrorString += `Missing required field: ${key}`;
        }
      });
      if (!request?.files) {
        console.error("Missing required field: images");
        missingErrorString += ", Missing required field: images";
      }
      return response.status(400).json({
        errorMessage:
          "Missing one or more required fields: [name, image, categories, subcategories, unit, stock, price, description]\n`Missing required field: ${key}`",
        success: false,
        timestamp: new Date().toISOString(),
      });
    }

    if (!Array.isArray(images) || images.length === 0) {
      return response.status(400).json({
        errorMessage: "Field `image` should be an non-empty array",
        success: false,
        timestamp: new Date().toISOString(),
      });
    }

    const product = await ProductModel.find({ name: name });
    if (product.length > 0) {
      return response.status(409).json({
        errorMessage: `Product with this name already exists!`,
        success: false,
        timestamp: new Date().toISOString(),
      });
    }

    let imageUrlsArray = [];
    for (let image of images) {
      try {
        if (image && image !== "" && image != null) {
          if (!IMAGE_MIMETYPE_LIST.includes(image?.mimetype)) {
            console.error(
              `Invalid file format ${image?.mimetype} at index ${index}! Choose a format from this list: ['image/jpeg', 'image/png', 'image/gif', 'image/bmp', 'image/webp', 'image/tiff', 'image/svg+xml', 'image/x-icon', 'image/heif', 'image/heic']`
            );
            continue;
          }
          const uploadResponse = await uploadImageToCloudinary(image);
          console.log("Image Upload Response Cloudinary: \n", uploadResponse);
          imageUrlsArray.push(uploadResponse?.url);
        }
      } catch (error) {
        console.error("Error uploading image to Cloudinary: ", error);
        continue;
      }
    }
    // const imageUrlsArray = images.map(async (image, index) => {

    // });

    const categoriesArray = JSON.parse(categories);
    if (!Array.isArray(categoriesArray) || categoriesArray.length === 0) {
      return response.status(400).json({
        errorMessage: "Field `categories` should be an non-empty array",
        success: false,
        timestamp: new Date().toISOString(),
      });
    }
    let categoryIdsArray = [];
    for (let categoryName of categoriesArray) {
      const category = await CategoryModel.findOne({
        name: categoryName,
      });
      if (!category) {
        return response.status(404).json({
          errorMessage: `Category with name ${categoryName} not found`,
          success: false,
          timestamp: new Date().toISOString(),
        });
      }
      categoryIdsArray.push(category._id);
    }

    const subcategoriesArray = JSON.parse(subcategories);
    if (!Array.isArray(subcategoriesArray) || subcategoriesArray.length === 0) {
      return response.status(400).json({
        errorMessage: "Field `subcategories` should be an non-empty array",
        success: false,
        timestamp: new Date().toISOString(),
      });
    }
    let subcategoryIdsArray = [];
    for (let subcategoryName of subcategoriesArray) {
      const subcategory = await SubCategoryModel.findOne({
        name: subcategoryName,
      });
      if (!subcategory) {
        return response.status(404).json({
          errorMessage: `Subcategory with name ${subcategoryName} not found`,
          success: false,
          timestamp: new Date().toISOString(),
        });
      }
      subcategoryIdsArray.push(subcategory._id);
    }

    const moreDetailsObject = more_details ? JSON.parse(more_details) : "{}";

    const newProduct = new ProductModel({
      name,
      image: imageUrlsArray,
      category_id: categoryIdsArray,
      sub_category_id: subcategoryIdsArray,
      unit,
      stock,
      price,
      discount,
      description,
      more_details: moreDetailsObject,
      publish: publish || true,
    });
    const savedProduct = await newProduct.save();
    console.log("Saved Product: ", savedProduct);

    return response.status(201).json({
      success: true,
      message: "Product added successfully",
      product: savedProduct,
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

export const getProductsController = async (request, response) => {
  try {
    if (request?.query?.all) {
      const dbResponse = await ProductModel.find()
        .populate("category_id", "name")
        .populate("sub_category_id", "name")
        .sort({ createdAt: -1 });
      if (!dbResponse) {
        return response.status(404).json({
          errorMessage: "No products found",
          success: false,
          timestamp: new Date().toISOString(),
        });
      }

      return response.status(200).json({
        message: "Products fetched successfully",
        count: dbResponse.length,
        data: dbResponse,
        success: true,
        timestamp: new Date().toISOString(),
      });
    }

    const pageSize = Number(request.query.pageSize) || 10;
    const currentPage = Number(request.query.currentPage) || 1;
    const skip = pageSize * (currentPage - 1);

    const search = request?.query?.search;
    console.log(search);
    // const searchQuery = search
    //   ? {
    //       $text: {
    //         $search: search,
    //       },
    //     }
    //   : {};
    const searchQuery = search
      ? {
          $or: [
            { name: { $regex: search, $options: "i" } },
            { description: { $regex: search, $options: "i" } },
          ],
        }
      : {};

    const [dbResponse, totalRecordCount] = await Promise.all([
      ProductModel.find(searchQuery)
        .populate("category_id", "name")
        .populate("sub_category_id", "name")
        .skip(skip)
        .limit(pageSize)
        .sort({ createdAt: -1 }),
      ProductModel.countDocuments(searchQuery),
    ]);

    if (!dbResponse) {
      return response.status(404).json({
        errorMessage: "No products found",
        success: false,
        timestamp: new Date().toISOString(),
      });
    }

    return response.status(200).json({
      message: "Products fetched successfully",
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

export const getProductsByCategoryController = async (request, response) => {
  try {
    const { categoryId, all } = request.query;
    if (!categoryId) {
      return response.status(400).json({
        errorMessage: "Missing required parameter `categoryId`",
        success: false,
        timestamp: new Date().toISOString(),
      });
    }
    if (!isValidObjectId(categoryId)) {
      return response.status(400).json({
        errorMessage: "Invalid categoryId",
        success: false,
        timestamp: new Date().toISOString(),
      });
    }

    if (all) {
      const dbResponse = await ProductModel.find({
        category_id: { $in: categoryId },
      })
        .populate("category_id", "name")
        .populate("sub_category_id", "name")
        .sort({ createdAt: -1 });
      if (!dbResponse) {
        return response.status(404).json({
          errorMessage: `No products found under categoryId: ${categoryId}`,
          success: false,
          timestamp: new Date().toISOString(),
        });
      }

      return response.status(200).json({
        message: "Products fetched successfully",
        count: dbResponse.length,
        data: dbResponse,
        success: true,
        timestamp: new Date().toISOString(),
      });
    }

    const pageSize = Number(request.query.pageSize) || 20;
    const currentPage = Number(request.query.currentPage) || 1;
    const skip = pageSize * (currentPage - 1);
    const [dbResponse, totalRecordCount] = await Promise.all([
      ProductModel.find({
        category_id: { $in: categoryId },
      })
        .populate("category_id", "name")
        .populate("sub_category_id", "name")
        .skip(skip)
        .limit(pageSize)
        .sort({ createdAt: -1 }),

      ProductModel.find({
        category_id: { $in: categoryId },
      }).countDocuments(),
    ]);

    if (!dbResponse) {
      return response.status(404).json({
        errorMessage: `No products found under categoryId: ${categoryId}`,
        success: false,
        timestamp: new Date().toISOString(),
      });
    }

    return response.status(200).json({
      message: "Products fetched successfully",
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

export const getProductsBySubcategoryController = async (request, response) => {
  try {
    const { subcategoryId, all } = request.query;
    if (!subcategoryId) {
      return response.status(400).json({
        errorMessage: "Missing required parameter `subcategoryId`",
        success: false,
        timestamp: new Date().toISOString(),
      });
    }
    if (!isValidObjectId(subcategoryId)) {
      return response.status(400).json({
        errorMessage: "Invalid subcategoryId",
        success: false,
        timestamp: new Date().toISOString(),
      });
    }
    if (all) {
      const dbResponse = await ProductModel.find({
        sub_category_id: { $in: subcategoryId },
      })
        .populate("category_id", "name")
        .populate("sub_category_id", "name")
        .sort({ createdAt: -1 });
      if (!dbResponse) {
        return response.status(404).json({
          errorMessage: `No products found under subcategoryId: ${subcategoryId}`,
          success: false,
          timestamp: new Date().toISOString(),
        });
      }
      return response.status(200).json({
        message: "Products fetched successfully",
        count: dbResponse.length,
        data: dbResponse,
        success: true,
        timestamp: new Date().toISOString(),
      });
    }

    const pageSize = Number(request.query.pageSize) || 20;
    const currentPage = Number(request.query.currentPage) || 1;

    const skip = pageSize * (currentPage - 1);
    const [dbResponse, totalRecordCount] = await Promise.all([
      ProductModel.find({
        sub_category_id: { $in: subcategoryId },
      })
        .populate("category_id", "name")
        .populate("sub_category_id", "name")
        .skip(skip)
        .limit(pageSize)
        .sort({ createdAt: -1 }),

      ProductModel.find({
        sub_category_id: { $in: subcategoryId },
      }).countDocuments(),
    ]);
    if (dbResponse.length === 0) {
      return response.status(404).json({
        errorMessage: `No products found under subcategoryId: ${subcategoryId}`,
        success: false,
        timestamp: new Date().toISOString(),
      });
    }
    return response.status(200).json({
      message: "Products fetched successfully",
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

export const editProductCategoryDataLoadController = async (
  request,
  response
) => {
  try {
    const { name, categories, subcategories } = request.body;

    if (!name) {
      return response.status(400).json({
        errorMessage: "Missing required parameter `name`",
        success: false,
        timestamp: new Date().toISOString(),
      });
    }

    let categoryIdsArray = [];
    if (Array.isArray(categories) || categories.length > 0) {
      for (let categoryName of categories) {
        const category = await CategoryModel.findOne({
          name: categoryName,
        });
        if (!category) {
          return response.status(404).json({
            errorMessage: `Category with name ${categoryName} not found`,
            success: false,
            timestamp: new Date().toISOString(),
          });
        }
        categoryIdsArray.push(category._id);
      }
    }

    let subcategoryIdsArray = [];
    if (Array.isArray(subcategories) || subcategories.length > 0) {
      for (let subcategoryName of subcategories) {
        const subcategory = await SubCategoryModel.findOne({
          name: subcategoryName,
        });
        if (!subcategory) {
          return response.status(404).json({
            errorMessage: `Subcategory with name ${subcategoryName} not found`,
            success: false,
            timestamp: new Date().toISOString(),
          });
        }
        subcategoryIdsArray.push(subcategory._id);
      }
    }

    const product = await ProductModel.findOne({ name: name });
    if (!product) {
      return response.status(404).json({
        errorMessage: `Product with this name does not exist!`,
        success: false,
        timestamp: new Date().toISOString(),
      });
    }

    if (categoryIdsArray.length > 0) {
      product.category_id = categoryIdsArray;
    }
    if (subcategoryIdsArray.length > 0) {
      product.sub_category_id = subcategoryIdsArray;
    }
    const savedProduct = await product.save();
    console.log("Saved Product: ", savedProduct);

    return response.status(200).json({
      success: true,
      message: "Product updated successfully",
      product: savedProduct,
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

export const getProductByIdController = async (request, response) => {
  try {
    const { productId } = request.query;

    if (!productId) {
      return response.status(400).json({
        errorMessage: "Missing required parameter `productId`",
        success: false,
        timestamp: new Date().toISOString(),
      });
    }

    if (!isValidObjectId(productId)) {
      return response.status(400).json({
        errorMessage: "Invalid product ID format",
        success: false,
        timestamp: new Date().toISOString(),
      });
    }

    const product = await ProductModel.findById(productId)
      .populate("category_id", "name")
      .populate("sub_category_id", "name");

    if (!product) {
      return response.status(404).json({
        errorMessage: "Product not found",
        success: false,
        timestamp: new Date().toISOString(),
      });
    }

    return response.status(200).json({
      message: "Product details fetched successfully",
      data: product,
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
