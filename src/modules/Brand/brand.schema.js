import Joi from "joi";
import { generalFields } from "../../utils/generalFields.js";

export const createBransSchema = {
  body: Joi.object({
    name: Joi.string().min(3).max(30).required(),
    category: Joi.string().hex().length(24).required(),
    subCateory: Joi.string().hex().length(24).required(),
  }),
  file: generalFields.file.required(),
};

export const updateBrandSchema = {
  body: Joi.object({ name: Joi.string().min(3).max(30).optional() }),
  file: generalFields.file.optional(),
};
export const checkParamsObjectId = {
  params: Joi.object({
    id: Joi.string().hex().length(24),
  }),
};
