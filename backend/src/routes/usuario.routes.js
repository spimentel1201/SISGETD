import { Router } from 'express';
import { param, body } from 'express-validator';
import validate from '../middlewares/validate.middleware.js';
import { authMiddleware, authorizeRoles } from '../middlewares/auth.middleware.js';
import * as UsuarioController from '../controllers/usuario.controller.js';

const router = Router();

// Listar usuarios (admin y funcionario pueden ver la lista)
router.get(
  '/',
  authMiddleware,
  authorizeRoles('admin', 'funcionario'),
  UsuarioController.listarUsuarios
);

// Asignar área a un funcionario
router.patch(
  '/:id/area',
  authMiddleware,
  authorizeRoles('admin'),
  [
    param('id').isUUID().withMessage('ID de usuario inválido.'),
    body('area_id').optional({ nullable: true }).isUUID().withMessage('El area_id debe ser un UUID válido.')
  ],
  validate,
  UsuarioController.asignarArea
);

// Desactivar usuario (borrado lógico)
router.patch(
  '/:id/desactivar',
  authMiddleware,
  authorizeRoles('admin'),
  [param('id').isUUID().withMessage('ID de usuario inválido.')],
  validate,
  UsuarioController.desactivarUsuario
);

// Reactivar usuario
router.patch(
  '/:id/reactivar',
  authMiddleware,
  authorizeRoles('admin'),
  [param('id').isUUID().withMessage('ID de usuario inválido.')],
  validate,
  UsuarioController.reactivarUsuario
);

export default router;
