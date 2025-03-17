import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
dotenv.config();

cloudinary.config({
  cloud_name: process.env["APP_CLOUDINARY_CLOUDNAME"],
  api_key: process.env["APP_CLOUDINARY_API_KEY"],
  api_secret: process.env["APP_CLOUDINARY_API_SECRET"],
});

export const uploadImageToCloudinary = async (image) => {
  const buffer = image.buffer || Buffer.from(await image.arrayBuffer());
  const uploadImage = await new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          folder: "blinkmart",
        },
        (error, uploadResult) => {
          return resolve(uploadResult);
        }
      )
      .end(buffer);
  });

  return uploadImage;
};

export const uploadBase64ImageToCloudinary = async (base64String) => {
  if (base64String.startsWith("data:image")) {
    const buffer = Buffer.from(base64String, "base64");
    const uploadImage = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder: "blinkmart",
          },
          (error, uploadResult) => {
            return resolve(uploadResult);
          }
        )
        .end(buffer);
    });

    return uploadImage;
  } else {
    throw new Error("Invalid base64 image format");
  }
};

// export default uploadImageToCloudinary;
