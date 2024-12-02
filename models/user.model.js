import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Required field `name` cannot be blank!"],
    },
    email: {
      type: String,
      required: [true, "Required field `email` cannot be blank!"],
      unique: [true, "Field `email` needs to be unique!"],
    },
    password: {
      type: String,
      required: [true, "Required field `password` cannot be blank!"],
    },
    avatar: {
      type: String,
      default: "",
    },
    mobile: {
      type: String,
      default: null,
    },
    refresh_token: {
      type: String,
      default: "",
    },
    email_is_verified: {
      type: Boolean,
      default: false,
    },
    last_login_date: {
      type: Date,
      default: "",
    },
    status: {
      type: String,
      enum: ["Active", "Inactive", "Suspended"],
      default: "Active",
    },
    address_details: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "address",
      },
    ],
    shopping_cart: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "cartProduct",
      },
    ],
    order_history: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "order",
      },
    ],
    forgot_password_otp: {
      type: String,
      default: null,
    },
    forgot_password_expiry: {
      type: Date,
      default: "",
    },
    role: {
      type: String,
      enum: ["ADMIN", "USER"],
      default: "USER",
    },
  },
  {
    timestamps: true,
  }
);

const UserModel = mongoose.model("user", userSchema);

export default UserModel;
