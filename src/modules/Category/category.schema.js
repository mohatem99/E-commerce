import Joi from "joi";
import { generalFields } from "../../utils/generalFields.js";

export const createCategorySchema = {
  body: Joi.object({ name: Joi.string().min(3).max(30).required() }),
  file: generalFields.file.required(),
};

export const updateCategorySchema = {
  body: Joi.object({ name: Joi.string().min(3).max(30).optional() }),
  file: generalFields.file.optional(),
};
export const checkParamsObjectId = {
  params: Joi.object({
    id: Joi.string().hex().length(24),
  }),
};
