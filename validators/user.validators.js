import { body } from "express-validator";

export const registerSkinTypeValidator = [
  body("skinTypeId")
    .exists({ checkFalsy: true })
    .withMessage("El tipo de piel es requerido")
    .bail()
    .isInt({ gt: 0 })
    .withMessage("El tipo de piel debe ser un identificador válido")
    .toInt(),
];

export const updateProfileValidator = [
  body("firstName")
    .optional()
    .isString().withMessage("El nombre debe ser un texto")
    .trim()
    .notEmpty().withMessage("El nombre no puede estar vacío")
    .isLength({ max: 100 }).withMessage("El nombre es demasiado largo"),

  body("lastName")
    .optional()
    .isString().withMessage("El apellido debe ser un texto")
    .trim()
    .notEmpty().withMessage("El apellido no puede estar vacío")
    .isLength({ max: 100 }).withMessage("El apellido es demasiado largo"),

  body("skinTypeId")
    .optional()
    .isInt({ gt: 0 }).withMessage("El tipo de piel debe ser un identificador válido")
    .toInt(),
];