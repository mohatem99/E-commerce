import Brand from "../../../db/models/brand.model.js";
import { asyncHandller } from "../../middlewares/errorHandling.js";
export const createBrand = asyncHandller(async (req, res, next) => {
  const { name } = req.body;

  const brandExist = await Brand.findOne({ name: name.toLowerCase() });

  if (brandExist) {
    return next(new ApiError("Brand already exists", 409));
  }
  if (!req.file) {
    return next(new ApiError("Image is required", 404));
  }

  const customId = nanoid(5);

  const { secure_url, public_id } = await cloudinaryConfig().uploader.upload(
    req.file.path,
    { folder: `E-commerce/Brands/${customId}` }
  );

  const brand = await Brand.create({
    name,
    slug: slugify(name),
    image: { secure_url, public_id },
    customId,
    createdBy: req.user._id,
  });
  res.status(200).json({
    status: "success",
    brand,
  });
});
