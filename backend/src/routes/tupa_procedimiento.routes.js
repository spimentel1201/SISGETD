import { Router } from 'express';
import { body, param } from 'express-validator';
import validate from '../middlewares/validate.middleware.js';
import { authMiddleware, authorizeRoles } from '../middlewares/auth.middleware.js';
import * as TupaController from '../controllers/tupa_procedimiento.controller.js';

const router = Router();

// Listar TUPAs activos (público, para que el ciudadano elija al crear expediente)
router.get('/', TupaController.listarTupas);

// Las siguientes rutas solo para admin
router.post(
  '/',
  authMiddleware,
  authorizeRoles('admin'),
  [
    body('codigo_tupa').notEmpty().withMessage('El código TUPA es obligatorio.'),
    body('nombre_tramite').notEmpty().withMessage('El nombre del trámite es obligatorio.'),
    body('dias_plazo_legal').isInt({ min: 1 }).withMessage('El plazo legal debe ser un número entero positivo.'),
    body('tipo_silencio').isIn(['positivo', 'negativo', 'automatico']).withMessage('Tipo de silencio inválido.'),
    body('area_responsable_id').isUUID().withMessage('El área responsable debe ser un UUID válido.'),
  ],
  validate,
  TupaController.registrarTupa
);

router.put(
  '/:id',
  authMiddleware,
  authorizeRoles('admin'),
  [param('id').isUUID().withMessage('ID de TUPA inválido.')],
  validate,
  TupaController.actualizarTupa
);

router.delete(
  '/:id',
  authMiddleware,
  authorizeRoles('admin'),
  [param('id').isUUID().withMessage('ID de TUPA inválido.')],
  validate,
  TupaController.desactivarTupa
);

export default router;
