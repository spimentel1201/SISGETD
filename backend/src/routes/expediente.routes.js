import { Router } from 'express';
import { body, param, query } from 'express-validator';
import validate from '../middlewares/validate.middleware.js';
import { authMiddleware, authorizeRoles } from '../middlewares/auth.middleware.js';
import upload from '../config/multer.js';
import { 
  crearExpediente, 
  obtenerExpedientes, 
  obtenerExpedientePorId, 
  obtenerEstadoExpediente,
  actualizarEstadoExpediente 
} from '../controllers/expediente.controller.js';

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
  crearExpediente
);

router.get(
  '/',
  authMiddleware,
  authorizeRoles('funcionario', 'admin'),
  obtenerExpedientes
);

router.get(
  '/:id',
  authMiddleware,
  [param('id').isUUID().withMessage('ID de expediente inválido.')],
  validate,
  obtenerExpedientePorId
);

router.get(
  '/:id/estado',
  [
    query('dni').notEmpty().withMessage('El DNI del titular es obligatorio.').isLength({ min: 8, max: 11 }).withMessage('DNI inválido.')
  ],
  validate,
  obtenerEstadoExpediente
);

router.put(
  '/:id/estado',
  authMiddleware,
  authorizeRoles('funcionario', 'admin'),
  [
    param('id').isUUID().withMessage('ID de expediente inválido.'),
    body('nuevo_estado').optional().isString(),
    body('observacion').optional().isString()
  ],
  validate,
  actualizarEstadoExpediente
);

export default router;
