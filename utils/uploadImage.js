import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
dotenv.config();

cloudinary.config({
  cloud_name: process.env["APP.CLOUDINARY.CLOUDNAME"],
  api_key: process.env["APP.CLOUDINARY.API_KEY"],
  api_secret: process.env["APP.CLOUDINARY.API_SECRET"],
});

const uploadImageToCloudinary = async (image) => {
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

export default uploadImageToCloudinary;
