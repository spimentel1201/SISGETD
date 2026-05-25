import { Router } from 'express';
import { body, param } from 'express-validator';
import validate from '../middlewares/validate.middleware.js';
import { authMiddleware, authorizeRoles } from '../middlewares/auth.middleware.js';
import upload from '../config/multer.js';

const router = Router();

router.post(
  '/',
  authMiddleware,
  upload.single('archivo'),
  [
    body('asunto')
      .isLength({ min: 20 })
      .withMessage('El asunto debe tener mínimo 20 caracteres.'),
    body('tupa_id')
      .isUUID()
      .withMessage('El código TUPA es requerido y debe ser un UUID válido.'),
  ],
  validate,
  (req, res) => {
    res.status(501).json({ message: 'Endpoint en construcción.' });
  }
);

router.get(
  '/',
  authMiddleware,
  authorizeRoles('funcionario', 'admin'),
  (req, res) => {
    res.status(501).json({ message: 'Endpoint en construcción.' });
  }
);

router.get(
  '/:id',
  [param('id').isUUID().withMessage('ID de expediente inválido.')],
  validate,
  (req, res) => {
    res.status(501).json({ message: 'Endpoint en construcción.' });
  }
);

router.get(
  '/:id/estado',
  [param('id').isUUID().withMessage('ID de expediente inválido.')],
  validate,
  (req, res) => {
    res.status(501).json({ message: 'Endpoint en construcción.' });
  }
);

export default router;
