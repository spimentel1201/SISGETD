import { Router } from 'express';
import { param } from 'express-validator';
import validate from '../middlewares/validate.middleware.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import * as NotificacionController from '../controllers/notificacion.controller.js';

const router = Router();

router.get(
  '/',
  authMiddleware,
  NotificacionController.obtenerMisNotificaciones
);

router.patch(
  '/:id/leido',
  authMiddleware,
  [param('id').isUUID().withMessage('ID de notificación inválido.')],
  validate,
  NotificacionController.marcarComoLeida
);

export default router;
