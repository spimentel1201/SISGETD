// peticion de post para crear un nuevo procedimiento
// peticion de get para obtener todos los procedimientos
// peticion de get para obtener un procedimiento por id
// peticion de put para actualizar un procedimiento por id
// peticion de delete para eliminar un procedimiento por id
import { Router } from 'express';
import { body, param } from 'express-validator';
import validate from '../middlewares/validate.middleware.js';
import { authMiddleware, authorizeRoles } from '../middlewares/auth.middleware.js';
import {
  getAll,
  getById,
  create,
  update,
  remove,
} from '../controllers/procedimiento.controller.js';

const router = Router();

// GET /api/procedimientos
router.get(
  '/',
  authMiddleware,
  getAll
);

// GET /api/procedimientos/:id
router.get(
  '/:id',
  authMiddleware,
  [param('id').isUUID().withMessage('ID de procedimiento inválido.')],
  validate,
  getById
);

// POST /api/procedimientos
router.post(
  '/',
  authMiddleware,
  authorizeRoles('funcionario', 'admin'),
  [
    body('codigo_tupa')
      .notEmpty()
      .withMessage('El código TUPA es requerido.')
      .isLength({ max: 30 })
      .withMessage('El código TUPA no debe superar los 30 caracteres.'),
    body('nombre_tramite')
      .notEmpty()
      .withMessage('El nombre del trámite es requerido.')
      .isLength({ min: 5, max: 200 })
      .withMessage('El nombre del trámite debe tener entre 5 y 200 caracteres.'),
    body('dias_plazo_legal')
      .isInt({ min: 1 })
      .withMessage('Los días de plazo legal deben ser un entero mayor a 0.'),
    body('tipo_silencio')
      .isIn(['positivo', 'negativo', 'automatico'])
      .withMessage('El tipo de silencio debe ser: positivo, negativo o automatico.'),
    body('area_responsable_id')
      .isUUID()
      .withMessage('El área responsable debe ser un UUID válido.'),
  ],
  validate,
  create
);

// PUT /api/procedimientos/:id
router.put(
  '/:id',
  authMiddleware,
  authorizeRoles('funcionario', 'admin'),
  [
    param('id').isUUID().withMessage('ID de procedimiento inválido.'),
    body('codigo_tupa')
      .optional()
      .isLength({ max: 30 })
      .withMessage('El código TUPA no debe superar los 30 caracteres.'),
    body('nombre_tramite')
      .optional()
      .isLength({ min: 5, max: 200 })
      .withMessage('El nombre del trámite debe tener entre 5 y 200 caracteres.'),
    body('dias_plazo_legal')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Los días de plazo legal deben ser un entero mayor a 0.'),
    body('tipo_silencio')
      .optional()
      .isIn(['positivo', 'negativo', 'automatico'])
      .withMessage('El tipo de silencio debe ser: positivo, negativo o automatico.'),
    body('area_responsable_id')
      .optional()
      .isUUID()
      .withMessage('El área responsable debe ser un UUID válido.'),
  ],
  validate,
  update
);

// DELETE /api/procedimientos/:id
router.delete(
  '/:id',
  authMiddleware,
  authorizeRoles('admin'),
  [param('id').isUUID().withMessage('ID de procedimiento inválido.')],
  validate,
  remove
);

export default router;