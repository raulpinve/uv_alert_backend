import { query } from "express-validator";

export const getUvInfoValidator = [
  query("fcmToken")
    .exists({ checkFalsy: true })
    .withMessage("El token FCM es obligatorio")
    .bail()
    .isString()
    .withMessage("El token FCM debe ser un texto"),
];