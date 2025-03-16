import { createHash } from "crypto";

export const getSHA256 = (buffer) => {
  return createHash("sha256").update(buffer).digest("hex");
};
