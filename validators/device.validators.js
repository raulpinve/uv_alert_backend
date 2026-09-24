import { body } from "express-validator";

export const syncDeviceValidator = [
  body("fcmToken")
    .exists({ checkFalsy: true })
    .withMessage("El token FCM es obligatorio")
    .bail()
    .isString()
    .withMessage("El token FCM debe ser un texto"),

  body("latitude")
    .exists()
    .withMessage("La latitud es obligatoria")
    .bail()
    .isFloat({ min: -90, max: 90 })
    .withMessage("La latitud debe ser un número entre -90 y 90"),

  body("longitude")
    .exists()
    .withMessage("La longitud es obligatoria")
    .bail()
    .isFloat({ min: -180, max: 180 })
    .withMessage("La longitud debe ser un número entre -180 y 180"),
];

export const unregisterDeviceValidator = [
  body("fcmToken")
    .exists({ checkFalsy: true })
    .withMessage("El token FCM es obligatorio")
    .bail()
    .isString()
    .withMessage("El token FCM debe ser un texto"),
];