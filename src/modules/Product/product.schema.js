import Joi from "joi";
import { generalFields } from "../../utils/generalFields.js";

export const createProductSchema = {
  body: Joi.object({
    title: Joi.string().min(3).max(30).required(),

    price: Joi.number().required(),
    description: Joi.string().optional(),
    stock: Joi.number().required(),
    discount: Joi.number().optional(),
    category: Joi.string().hex().length(24).required(),
    subCateory: Joi.string().hex().length(24).required(),
    brand: Joi.string().hex().length(24).required(),
  }),
  file: generalFields.file.required(),
};

export const updateProductSchema = {
  body: Joi.object({
    title: Joi.string().min(3).max(30).optional(),

    price: Joi.number().optional(),
    description: Joi.string().optional(),
    stock: Joi.number().required(),
    discount: Joi.number().optional(),
    category: Joi.string().hex().length(24).optional(),
    subCateory: Joi.string().hex().length(24).optional(),
    brand: Joi.string().hex().length(24).optional(),
  }),
  file: generalFields.file.optional(),
};
export const checkParamsObjectId = {
  params: Joi.object({
    id: Joi.string().hex().length(24),
  }),
};
