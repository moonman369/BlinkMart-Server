import dotenv from "dotenv";

dotenv.config();

export const IMAGE_MIMETYPE_LIST = [
  "image/jpeg", // JPEG/JPG
  "image/png", // PNG
  "image/gif", // GIF
  "image/bmp", // BMP
  "image/webp", // WebP
  "image/tiff", // TIFF
  "image/svg+xml", // SVG
  "image/x-icon", // ICO
  "image/heif", // HEIF
  "image/heic", // HEIC
];

export const MINUTES_TO_MILLIS = 60 * 1000;

export const ENV_DEV = "dev";
export const ENV_PROD = "prod";

export const COOKIE_OPTIONS = {
  path: "/",
  httpOnly: process.env.NODE_ENV === ENV_PROD,
  secure: process.env.NODE_ENV === ENV_PROD,
  sameSite: "Lax",
};
