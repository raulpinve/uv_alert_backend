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