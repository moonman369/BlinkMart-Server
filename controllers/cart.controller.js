import UserModel from "../models/user.model.js";
import CartProductModel from "../models/cart_product.model.js";
import { isValidObjectId } from "mongoose";

// Get user's shopping cart
export const getCartController = async (request, response) => {
  try {
    const { userId } = request.query;

    if (!userId) {
      return response.status(400).json({
        errorMessage: "Required field 'userId' was not provided",
        success: false,
        timestamp: new Date().toISOString(),
      });
    }

    if (!isValidObjectId(userId)) {
      return response.status(400).json({
        errorMessage: "Invalid user ID format",
        success: false,
        timestamp: new Date().toISOString(),
      });
    }

    const user = await UserModel.findById(userId).populate({
      path: "shopping_cart",
      populate: [
        {
          path: "user_id",
          model: "user",
          select: "username email", // Only select fields you need
        },
        {
          path: "product",
          model: "product",
          select: "name price description images category status", // Only select fields you need
        },
      ],
    });

    if (!user) {
      return response.status(404).json({
        errorMessage: "User not found",
        success: false,
        timestamp: new Date().toISOString(),
      });
    }

    return response.status(200).json({
      message: "Shopping cart fetched successfully",
      data: user.shopping_cart,
      success: true,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Get cart error:", error);
    return response.status(500).json({
      errorMessage: error.message,
      errorDetails: error,
      success: false,
      timestamp: new Date().toISOString(),
    });
  }
};

// Add product to cart
export const addToCartController = async (request, response) => {
  try {
    const { userId, productId, quantity } = request.body;
    if (!userId) {
      return response.status(400).json({
        errorMessage: "Required field 'userId' was not provided",
        success: false,
        timestamp: new Date().toISOString(),
      });
    }
    if (!isValidObjectId(userId)) {
      return response.status(400).json({
        errorMessage: "Invalid user ID or product ID format",
        success: false,
        timestamp: new Date().toISOString(),
      });
    }

    if (!productId) {
      return response.status(400).json({
        errorMessage: "Required field 'productId' was not provided",
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

    // Validate quantity
    const parsedQuantity = parseInt(quantity) || 1;
    if (parsedQuantity < 1) {
      return response.status(400).json({
        errorMessage: "Quantity must be greater than 0",
        success: false,
        timestamp: new Date().toISOString(),
      });
    }

    // Create or update cart product
    let cartProduct = await CartProductModel.findOne({
      user_id: userId,
      product: productId,
    });

    if (cartProduct) {
      cartProduct.quantity += parsedQuantity;
      await cartProduct.save();
    } else {
      cartProduct = await CartProductModel.create({
        user_id: userId,
        product: productId,
        quantity: parsedQuantity,
      });
    }

    await UserModel.findByIdAndUpdate(
      userId,
      {
        $addToSet: { shopping_cart: cartProduct._id },
      },
      { new: true }
    );

    return response.status(200).json({
      message: "Product added to cart successfully",
      data: cartProduct,
      success: true,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Add to cart error:", error);
    return response.status(500).json({
      errorMessage: error.message,
      errorDetails: error,
      success: false,
      timestamp: new Date().toISOString(),
    });
  }
};

// Remove product from cart
export const removeFromCartController = async (request, response) => {
  try {
    const { userId, cartProductId, all } = request.body;

    if (!userId) {
      return response.status(400).json({
        errorMessage: "Required field 'userId' was not provided",
        success: false,
        timestamp: new Date().toISOString(),
      });
    }
    if (!isValidObjectId(userId)) {
      return response.status(400).json({
        errorMessage: "Invalid user ID format",
        success: false,
        timestamp: new Date().toISOString(),
      });
    }

    if (!cartProductId) {
      return response.status(400).json({
        errorMessage: "Required field 'cartProductId' was not provided",
        success: false,
        timestamp: new Date().toISOString(),
      });
    }

    if (!isValidObjectId(cartProductId)) {
      return response.status(400).json({
        errorMessage: "Invalid user ID or cart product ID format",
        success: false,
        timestamp: new Date().toISOString(),
      });
    }

    // Verify cart product exists and belongs to user
    const cartProduct = await CartProductModel.findOne({
      _id: cartProductId,
      user_id: userId,
    });

    if (!cartProduct) {
      return response.status(404).json({
        errorMessage: "Cart product not found or doesn't belong to user",
        success: false,
        timestamp: new Date().toISOString(),
      });
    }

    if (cartProduct.quantity < 1) {
      return response.status(400).json({
        errorMessage: "Cart product quantity is less than 1",
        success: false,
        timestamp: new Date().toISOString(),
      });
    }

    if (all || cartProduct.quantity == 1) {
      // Remove from user's shopping_cart array
      await CartProductModel.findByIdAndDelete(cartProductId);
      // Remove cart product from user's shopping_cart array
      await UserModel.findByIdAndUpdate(
        userId,
        {
          $pull: { shopping_cart: cartProductId },
        },
        { new: true }
      );
    } else {
      // Decrease quantity or remove from cart
      if (cartProduct.quantity > 1) {
        cartProduct.quantity -= 1;
        await cartProduct.save();
      }
    }

    return response.status(200).json({
      message: "Product removed from cart successfully",
      data: { cartProduct },
      success: true,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Remove from cart error:", error);
    return response.status(500).json({
      errorMessage: error.message,
      errorDetails: error,
      success: false,
      timestamp: new Date().toISOString(),
    });
  }
};

// Clear entire cart
export const clearCartController = async (request, response) => {
  try {
    const { userId } = request.query;

    if (!userId) {
      return response.status(400).json({
        errorMessage: "Required field 'userId' was not provided",
        success: false,
        timestamp: new Date().toISOString(),
      });
    }

    if (!isValidObjectId(userId)) {
      return response.status(400).json({
        errorMessage: "Invalid user ID format",
        success: false,
        timestamp: new Date().toISOString(),
      });
    }

    // Get user's cart items
    const user = await UserModel.findById(userId);
    if (!user) {
      return response.status(404).json({
        errorMessage: "User not found",
        success: false,
        timestamp: new Date().toISOString(),
      });
    }

    // Check if cart is already empty
    if (!user.shopping_cart || user.shopping_cart.length === 0) {
      return response.status(200).json({
        message: "Cart is already empty",
        success: true,
        timestamp: new Date().toISOString(),
      });
    }

    // Delete all cart products
    const deleteResult = await CartProductModel.deleteMany({
      _id: { $in: user.shopping_cart },
    });

    // Clear user's shopping_cart array
    const updateResult = await UserModel.findByIdAndUpdate(
      userId,
      { shopping_cart: [] },
      { new: true }
    );

    if (!updateResult) {
      return response.status(500).json({
        errorMessage: "Failed to clear user's cart",
        success: false,
        timestamp: new Date().toISOString(),
      });
    }

    return response.status(200).json({
      message: "Cart cleared successfully",
      data: { itemsRemoved: deleteResult.deletedCount },
      success: true,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Clear cart error:", error);
    return response.status(500).json({
      errorMessage: error.message,
      errorDetails: error,
      success: false,
      timestamp: new Date().toISOString(),
    });
  }
};
