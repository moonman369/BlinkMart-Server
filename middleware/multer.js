import multer from "multer";

const storage = multer.memoryStorage();

const tempStorage = multer({
  storage: storage,
});

export default tempStorage;
