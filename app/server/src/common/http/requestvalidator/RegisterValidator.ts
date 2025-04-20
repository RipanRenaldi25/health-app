import joi from "joi";
import { roles } from "../../../services/SeedService";

export const registerPayloadSchema = joi.object({
  username: joi.string().min(3).required(),
  email: joi.string().email().required(),
  password: joi.string().min(6).required(),
  role: joi.number().min(1).max(roles.length),
  isVerified: joi.boolean(),
  institutionId: joi.number(),
});

export const institutionRegisterPayloadSchema = joi.object({
  username: joi.string().min(3).required(),
  password: joi.string().min(6).required(),
  address: joi.string().required(),
  headNip: joi.string(),
  headName: joi.string(),
  name: joi.string().required(),
  phoneNumber: joi.string().required(),
  email: joi.string().email().required(),
  roleId: joi.number().custom((value, helpers) => {
    if (value !== 2 && value !== 3) {
      return helpers.error("ONLY School (2) and Health Care (3) are allowed");
    }
    return value;
  }),
});

export const updateUserSchema = joi.object({
  username: joi.string().required(),
  email: joi.string().email().required(),
  password: joi.string(),
  isVerified: joi.boolean().required(),
  roleId: joi.number(),
});
