import ProductModel from "../models/product.model.js";
import { uploadImageToCloudinary } from "../utils/uploadImage.js";

export const addProductController = async (request, response) => {
  try {
    const {
      name,
      image,
      categories,
      subcategories,
      unit,
      stock,
      price,
      discount,
      description,
      more_details,
    } = request.body;

    if (
      !name ||
      !image ||
      !categories ||
      !subcategories ||
      !unit ||
      !stock ||
      !price ||
      !description
    ) {
      return response.status(400).json({
        errorMessage:
          "Missing one or more required fields: [name, image, categories, subcategories, unit, stock, price, description]",
        success: false,
        timestamp: new Date().toISOString(),
      });
    }

    const imageArray = JSON.parse(image);
    if (!Array.isArray(imageArray) || imageArray.length === 0) {
      return response.status(400).json({
        errorMessage: "Field `image` should be an non-empty array",
        success: false,
        timestamp: new Date().toISOString(),
      });
    }
    const imageUrlsArray = imageArray.map(async (image, index) => {
      try {
        if (image && image !== "" && image != null) {
          if (!IMAGE_MIMETYPE_LIST.includes(image?.mimetype)) {
            console.error(
              `Invalid file format at index ${index}! Choose a format from this list: ['image/jpeg', 'image/png', 'image/gif', 'image/bmp', 'image/webp', 'image/tiff', 'image/svg+xml', 'image/x-icon', 'image/heif', 'image/heic']`
            );
            return "";
          }
          const uploadResponse = await uploadImageToCloudinary(image);
          uploadedImageUrl = uploadResponse?.url;
          console.log("Image Upload Response Cloudinary: \n", uploadResponse);
          return uploadedImageUrl;
        }
      } catch (error) {
        console.error("Error uploading image to Cloudinary: ", error);
        return "";
      }
    });

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
      categories: categoriesArray,
      subcategories: subcategoriesArray,
      unit,
      stock,
      price,
      discount,
      description,
      more_details: moreDetailsObject,
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
