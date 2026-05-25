import { Router } from 'express';
import { authMiddleware, authorizeRoles } from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/kpis', authMiddleware, authorizeRoles('funcionario', 'admin'), (req, res) => {
  res.status(501).json({ message: 'Endpoint en construcción.' });
});

router.get('/expedientes-criticos', authMiddleware, authorizeRoles('funcionario', 'admin'), (req, res) => {
  res.status(501).json({ message: 'Endpoint en construcción.' });
});

export default router;
