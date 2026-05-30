import { Router } from 'express';
import { body, param } from 'express-validator';
import validate from '../middlewares/validate.middleware.js';
import { authMiddleware, authorizeRoles } from '../middlewares/auth.middleware.js';
import * as AreaController from '../controllers/area.controller.js';

const router = Router();

// Listar áreas (público: para asignar en formularios)
router.get('/', AreaController.listarArea);

// Obtener área por ID (público)
router.get(
  '/:id',
  [param('id').isUUID().withMessage('ID de área inválido.')],
  validate,
  AreaController.obtenerAreaPorId
);

// Crear área (solo admin)
router.post(
  '/',
  authMiddleware,
  authorizeRoles('admin'),
  [
    body('codigo').notEmpty().withMessage('El código es obligatorio.'),
    body('nombre').notEmpty().withMessage('El nombre es obligatorio.'),
    body('gerencia').notEmpty().withMessage('La gerencia es obligatoria.'),
  ],
  validate,
  AreaController.registrarArea
);

// Actualizar área (solo admin)
router.put(
  '/:id',
  authMiddleware,
  authorizeRoles('admin'),
  [param('id').isUUID().withMessage('ID de área inválido.')],
  validate,
  AreaController.actualizarArea
);

// Desactivar área - borrado lógico (solo admin)
router.delete(
  '/:id',
  authMiddleware,
  authorizeRoles('admin'),
  [param('id').isUUID().withMessage('ID de área inválido.')],
  validate,
  AreaController.eliminarArea
);

export default router;