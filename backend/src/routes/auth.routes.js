const router = require('express').Router();
const { body } = require('express-validator');
const validate = require('../middlewares/validate.middleware');

// POST /api/auth/register
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
  (req, res) => {
    // TODO: implementar AuthController.register
    res.status(501).json({ message: 'Endpoint en construcción.' });
  }
);

// POST /api/auth/login
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Email inválido.'),
    body('password').notEmpty().withMessage('La contraseña es requerida.'),
  ],
  validate,
  (req, res) => {
    // TODO: implementar AuthController.login
    res.status(501).json({ message: 'Endpoint en construcción.' });
  }
);

module.exports = router;
