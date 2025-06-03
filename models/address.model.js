import mongoose from "mongoose";

const addressSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.ObjectId,
      ref: "user",
      required: true,
    },
    address_name: {
      type: String,
      required: [true, "Required field `address_name` cannot be blank!"],
    },
    address_line_1: {
      type: String,
      default: "",
    },
    city: {
      type: String,
      default: "",
    },
    address_line_2: {
      type: String,
      default: "",
    },
    state: {
      type: String,
      default: "",
    },
    pincode: {
      type: String,
      default: "",
    },
    country: {
      type: String,
      default: "",
    },
    mobile: {
      type: String,
      default: null,
    },
    address_type: {
      type: String,
      enum: ["Home", "Work", "Other"],
      default: "Home",
    },
    is_active: {
      type: Boolean,
      default: true,
    },
    is_default: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const AddressModel = mongoose.model("address", addressSchema);

export default AddressModel;
