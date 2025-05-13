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

// Token expiry times in seconds
export const ACCESS_TOKEN_EXPIRY = process.env.SERVER_TOKEN_ACCESS_TTL || "15m";
export const REFRESH_TOKEN_EXPIRY =
  process.env.SERVER_TOKEN_REFRESH_TTL || "7d";

// Convert time string to milliseconds
const convertTimeToMs = (timeStr) => {
  const unit = timeStr.slice(-1);
  const value = parseInt(timeStr.slice(0, -1));

  switch (unit) {
    case "s":
      return value * 1000;
    case "m":
      return value * 60 * 1000;
    case "h":
      return value * 60 * 60 * 1000;
    case "d":
      return value * 24 * 60 * 60 * 1000;
    default:
      return 15 * 60 * 1000; // Default 15 minutes
  }
};

export const COOKIE_OPTIONS = {
  path: "/",
  httpOnly: process.env.NODE_ENV === ENV_PROD,
  secure: process.env.NODE_ENV === ENV_PROD,
  sameSite: process.env.NODE_ENV === ENV_PROD ? "None" : "Lax",
};

export const ACCESS_TOKEN_COOKIE_OPTIONS = {
  ...COOKIE_OPTIONS,
  maxAge: convertTimeToMs(ACCESS_TOKEN_EXPIRY),
};

export const REFRESH_TOKEN_COOKIE_OPTIONS = {
  ...COOKIE_OPTIONS,
  maxAge: convertTimeToMs(REFRESH_TOKEN_EXPIRY),
};
