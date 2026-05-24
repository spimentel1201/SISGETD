const router = require('express').Router();
const { body, param, query } = require('express-validator');
const validate = require('../middlewares/validate.middleware');
const { authMiddleware, authorizeRoles } = require('../middlewares/auth.middleware');
const upload = require('../config/multer');

// POST /api/expedientes — Crear nuevo expediente (ciudadano autenticado)
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
  (req, res) => {
    // TODO: implementar ExpedienteController.create
    res.status(501).json({ message: 'Endpoint en construcción.' });
  }
);

// GET /api/expedientes — Listar expedientes (funcionarios/admin)
router.get(
  '/',
  authMiddleware,
  authorizeRoles('funcionario', 'admin'),
  (req, res) => {
    // TODO: implementar ExpedienteController.list
    res.status(501).json({ message: 'Endpoint en construcción.' });
  }
);

// GET /api/expedientes/:id — Detalle de expediente
router.get(
  '/:id',
  [param('id').isUUID().withMessage('ID de expediente inválido.')],
  validate,
  (req, res) => {
    // TODO: implementar ExpedienteController.getById
    res.status(501).json({ message: 'Endpoint en construcción.' });
  }
);

// GET /api/expedientes/:id/estado — Estado público (sin auth, solo N° + DNI)
router.get(
  '/:id/estado',
  [param('id').isUUID().withMessage('ID de expediente inválido.')],
  validate,
  (req, res) => {
    // TODO: implementar ExpedienteController.getEstadoPublico
    res.status(501).json({ message: 'Endpoint en construcción.' });
  }
);

module.exports = router;
