import { Router } from 'express';
import { body } from 'express-validator';
import validate from '../middlewares/validate.middleware.js';
import * as AuthController from '../controllers/auth.controller.js';

const router = Router();

router.post(
  '/register',
  [
    body('dni').isLength({ min: 8, max: 11 }).withMessage('DNI/RUC inválido.'),
    body('nombre').notEmpty().withMessage('El nombre es requerido.'),
    body('email').isEmail().withMessage('Email inválido.'),
    body('password')
      .isLength({ min: 8 })
      .withMessage('La contraseña debe tener mínimo 8 caracteres.'),
  ],
  validate,
  AuthController.register
);

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Email inválido.'),
    body('password').notEmpty().withMessage('La contraseña es requerida.'),
  ],
  validate,
  AuthController.login
);

export default router;
