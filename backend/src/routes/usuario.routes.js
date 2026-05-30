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

// Obtener usuario por ID
router.get(
  '/:id',
  authMiddleware,
  authorizeRoles('admin', 'funcionario'),
  [param('id').isUUID().withMessage('ID de usuario inválido.')],
  validate,
  UsuarioController.obtenerUsuarioPorId
);

// Actualizar usuario
router.put(
  '/:id',
  authMiddleware,
  authorizeRoles('admin'),
  [
    param('id').isUUID().withMessage('ID de usuario inválido.'),
    body('nombre').optional().notEmpty().withMessage('El nombre no puede estar vacío.'),
    body('email').optional().isEmail().withMessage('Email inválido.'),
    body('rol').optional().isIn(['admin', 'funcionario', 'ciudadano']).withMessage('Rol inválido.')
  ],
  validate,
  UsuarioController.actualizarUsuario
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
