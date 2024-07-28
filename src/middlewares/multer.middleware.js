import multer from "multer";
import { extenstions } from "../utils/file-extensions.utils.js";
import ApiError from "../utils/errorClass.js";

export const multerHost = ({ allowedExtensions = extenstions.Images }) => {
  const storage = multer.diskStorage({});

  function fileFilter(req, file, cb) {
    console.log(file);

    if (allowedExtensions.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new ApiError(`Invalid file type, only ${allowedExtensions}`, 404),
        false
      );
    }
  }

  return multer({
    storage,
    fileFilter,
  });
};
