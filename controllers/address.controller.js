import { isValidObjectId } from "mongoose";
import UserModel from "../models/user.model.js";
import AddressModel from "../models/address.model.js";

/**
 * Get all addresses for a user
 */
export const getAllAddressesController = async (request, response) => {
  try {
    const { userId } = request;

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

    const user = await UserModel.findById(userId).populate("address_details");

    if (!user) {
      return response.status(404).json({
        errorMessage: "User not found",
        success: false,
        timestamp: new Date().toISOString(),
      });
    }

    return response.status(200).json({
      message: "Addresses fetched successfully",
      data: user.address_details,
      success: true,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Get addresses error:", error);
    return response.status(500).json({
      errorMessage: error.message,
      errorDetails: error,
      success: false,
      timestamp: new Date().toISOString(),
    });
  }
};

/**
 * Get a specific address by ID
 */
export const getAddressByIdController = async (request, response) => {
  try {
    const { userId } = request;
    const { addressId } = request.params;

    if (!userId || !addressId) {
      return response.status(400).json({
        errorMessage:
          "Required fields 'userId' or 'addressId' were not provided",
        success: false,
        timestamp: new Date().toISOString(),
      });
    }

    if (!isValidObjectId(userId) || !isValidObjectId(addressId)) {
      return response.status(400).json({
        errorMessage: "Invalid user ID or address ID format",
        success: false,
        timestamp: new Date().toISOString(),
      });
    }

    const address = await AddressModel.findOne({
      _id: addressId,
      user_id: userId,
    });

    if (!address) {
      return response.status(404).json({
        errorMessage: "Address not found or doesn't belong to user",
        success: false,
        timestamp: new Date().toISOString(),
      });
    }

    return response.status(200).json({
      message: "Address fetched successfully",
      data: address,
      success: true,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Get address by id error:", error);
    return response.status(500).json({
      errorMessage: error.message,
      errorDetails: error,
      success: false,
      timestamp: new Date().toISOString(),
    });
  }
};

/**
 * Add a new address for a user
 */
export const addAddressController = async (request, response) => {
  try {
    const { userId } = request;
    const {
      addressName,
      addressLine1,
      addressLine2,
      city,
      state,
      country,
      postalCode,
      mobile,
      isDefault,
      addressType,
    } = request.body;

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

    // Validate required fields
    if (
      !addressName ||
      !addressLine1 ||
      !city ||
      !state ||
      !country ||
      !postalCode ||
      !mobile
    ) {
      return response.status(400).json({
        errorMessage: "Missing required address fields",
        success: false,
        timestamp: new Date().toISOString(),
      });
    }

    // If new address is set as default, unset default flag on existing addresses
    if (isDefault) {
      await AddressModel.updateMany(
        { user_id: userId, is_default: true },
        { is_default: false }
      );
    }

    // Create the new address
    const newAddress = await AddressModel.create({
      user_id: userId,
      address_name: addressName,
      address_line_1: addressLine1,
      address_line_2: addressLine2 || "",
      city,
      state,
      country,
      postalCode,
      mobile,
      is_default: isDefault || false,
      address_type: addressType || "Home",
    });

    // Add address to user's address_details array
    const updateResult = await UserModel.findByIdAndUpdate(
      userId,
      {
        $addToSet: { address_details: newAddress._id },
      },
      { new: true }
    );

    if (!updateResult) {
      return response.status(500).json({
        errorMessage: "Failed to update user's addresses",
        success: false,
        timestamp: new Date().toISOString(),
      });
    }

    return response.status(201).json({
      message: "Address added successfully",
      data: newAddress,
      success: true,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Add address error:", error);
    return response.status(500).json({
      errorMessage: error.message,
      errorDetails: error,
      success: false,
      timestamp: new Date().toISOString(),
    });
  }
};

/**
 * Update an existing address
 */
export const updateAddressController = async (request, response) => {
  try {
    const { userId } = request;
    const { addressId } = request.params;
    const updateData = request.body;

    if (!userId || !addressId) {
      return response.status(400).json({
        errorMessage:
          "Required fields 'userId' or 'addressId' were not provided",
        success: false,
        timestamp: new Date().toISOString(),
      });
    }

    if (!isValidObjectId(userId) || !isValidObjectId(addressId)) {
      return response.status(400).json({
        errorMessage: "Invalid user ID or address ID format",
        success: false,
        timestamp: new Date().toISOString(),
      });
    }

    // Verify address belongs to user
    const existingAddress = await AddressModel.findOne({
      _id: addressId,
      user_id: userId,
    });

    if (!existingAddress) {
      return response.status(404).json({
        errorMessage: "Address not found or doesn't belong to user",
        success: false,
        timestamp: new Date().toISOString(),
      });
    }

    // If setting as default, unset other defaults
    if (updateData.isDefault) {
      await AddressModel.updateMany(
        { user_id: userId, isDefault: true, _id: { $ne: addressId } },
        { isDefault: false }
      );
    }

    // Update the address
    const updatedAddress = await AddressModel.findByIdAndUpdate(
      addressId,
      updateData,
      { new: true }
    );

    return response.status(200).json({
      message: "Address updated successfully",
      data: updatedAddress,
      success: true,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Update address error:", error);
    return response.status(500).json({
      errorMessage: error.message,
      errorDetails: error,
      success: false,
      timestamp: new Date().toISOString(),
    });
  }
};

/**
 * Delete an address
 */
export const deleteAddressController = async (request, response) => {
  try {
    const { userId } = request;
    const { addressId } = request.params;

    if (!userId || !addressId) {
      return response.status(400).json({
        errorMessage:
          "Required fields 'userId' or 'addressId' were not provided",
        success: false,
        timestamp: new Date().toISOString(),
      });
    }

    if (!isValidObjectId(userId) || !isValidObjectId(addressId)) {
      return response.status(400).json({
        errorMessage: "Invalid user ID or address ID format",
        success: false,
        timestamp: new Date().toISOString(),
      });
    }

    // Verify address belongs to user
    const addressExists = await AddressModel.findOne({
      _id: addressId,
      user_id: userId,
    });

    if (!addressExists) {
      return response.status(404).json({
        errorMessage: "Address not found or doesn't belong to user",
        success: false,
        timestamp: new Date().toISOString(),
      });
    }

    // Remove from user's address_details array
    await UserModel.findByIdAndUpdate(
      userId,
      {
        $pull: { address_details: addressId },
      },
      { new: true }
    );

    // Delete the address
    await AddressModel.findByIdAndDelete(addressId);

    return response.status(200).json({
      message: "Address deleted successfully",
      data: { deletedAddressId: addressId },
      success: true,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Delete address error:", error);
    return response.status(500).json({
      errorMessage: error.message,
      errorDetails: error,
      success: false,
      timestamp: new Date().toISOString(),
    });
  }
};

/**
 * Set an address as default
 */
export const setDefaultAddressController = async (request, response) => {
  try {
    const { userId } = request;
    const { addressId } = request.params;

    if (!userId || !addressId) {
      return response.status(400).json({
        errorMessage:
          "Required fields 'userId' or 'addressId' were not provided",
        success: false,
        timestamp: new Date().toISOString(),
      });
    }

    if (!isValidObjectId(userId) || !isValidObjectId(addressId)) {
      return response.status(400).json({
        errorMessage: "Invalid user ID or address ID format",
        success: false,
        timestamp: new Date().toISOString(),
      });
    }

    // Verify address belongs to user
    const addressExists = await AddressModel.findOne({
      _id: addressId,
      user_id: userId,
    });

    if (!addressExists) {
      return response.status(404).json({
        errorMessage: "Address not found or doesn't belong to user",
        success: false,
        timestamp: new Date().toISOString(),
      });
    }

    // Unset default flag on all addresses
    await AddressModel.updateMany(
      { user_id: userId, isDefault: true },
      { isDefault: false }
    );

    // Set the selected address as default
    const updatedAddress = await AddressModel.findByIdAndUpdate(
      addressId,
      { isDefault: true },
      { new: true }
    );

    return response.status(200).json({
      message: "Address set as default successfully",
      data: updatedAddress,
      success: true,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Set default address error:", error);
    return response.status(500).json({
      errorMessage: error.message,
      errorDetails: error,
      success: false,
      timestamp: new Date().toISOString(),
    });
  }
};
