const router = require('express').Router();
const { authMiddleware, authorizeRoles } = require('../middlewares/auth.middleware');

// GET /api/dashboard/kpis
router.get('/kpis', authMiddleware, authorizeRoles('funcionario', 'admin'), (req, res) => {
  // TODO: implementar DashboardController.getKpis
  res.status(501).json({ message: 'Endpoint en construcción.' });
});

// GET /api/dashboard/expedientes-criticos
router.get('/expedientes-criticos', authMiddleware, authorizeRoles('funcionario', 'admin'), (req, res) => {
  // TODO: implementar DashboardController.getExpedientesCriticos
  res.status(501).json({ message: 'Endpoint en construcción.' });
});

module.exports = router;
