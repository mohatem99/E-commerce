import { cloudinaryConfig } from "./cloudinary.utils.js";

export const deleteFromCloudinary = async (req, res, next) => {
  if (req?.filepath) {
    await cloudinaryConfig().api.delete_resources_by_prefix(req.filepath);
    await cloudinaryConfig().api.delete_folder(req.filepath);
    next();
  }
};
