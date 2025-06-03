import express from "express";
import {
  getAllAddressesController,
  getAddressByIdController,
  addAddressController,
  updateAddressController,
  deleteAddressController,
  setDefaultAddressController,
} from "../controllers/address.controller.js";
import { auth } from "../middleware/auth.js";

const addressRouter = express.Router();

// Get all addresses for a user
addressRouter.get("/get-all-addresses", auth, getAllAddressesController);

// Get address by ID
addressRouter.get("/get-address/:addressId", auth, getAddressByIdController);

// Add a new address
addressRouter.post("/add-address", auth, addAddressController);

// Update an existing address
addressRouter.put("/update-address/:addressId", auth, updateAddressController);

// Delete an address
addressRouter.delete(
  "/delete-address/:addressId",
  auth,
  deleteAddressController
);

// Set an address as default
addressRouter.patch(
  "/set-default/:addressId",
  auth,
  setDefaultAddressController
);

export default addressRouter;
