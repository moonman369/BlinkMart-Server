import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: "",
    },
    image: {
      type: Array,
      default: [],
    },
    category_id: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "category",
      },
    ],
    sub_category_id: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "sub_category",
      },
    ],
    unit: {
      type: String,
      default: "",
    },
    stock: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      default: 0,
    },
    discount: {
      type: Number,
      default: 0,
    },
    more_details: {
      type: Object,
      default: {},
    },
    publish: {
      type: Boolean,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

productSchema.index(
  {
    name: "text",
    description: "text",
  },
  {
    name: 10,
    description: 5,
  }
);

const ProductModel = mongoose.model("product", productSchema);

export default ProductModel;
