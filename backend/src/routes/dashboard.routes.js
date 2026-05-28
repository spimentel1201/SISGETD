import { Router } from 'express';
import { authMiddleware, authorizeRoles } from '../middlewares/auth.middleware.js';
import * as DashboardController from '../controllers/dashboard.controller.js';

const router = Router();

router.get('/kpis', authMiddleware, authorizeRoles('funcionario', 'admin'), DashboardController.getKPIs);

router.get('/expedientes-criticos', authMiddleware, authorizeRoles('funcionario', 'admin'), DashboardController.getExpedientesCriticos);

export default router;
