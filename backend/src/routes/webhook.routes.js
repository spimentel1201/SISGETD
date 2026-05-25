import { Router } from 'express';
import { body } from 'express-validator';
import validate from '../middlewares/validate.middleware.js';

const router = Router();

router.post(
  '/ml-resultado',
  [
    body('expediente_id').isUUID().withMessage('expediente_id inválido.'),
    body('tupa_id').isUUID().withMessage('tupa_id inválido.'),
    body('area_asignada_id').isUUID().withMessage('area_asignada_id inválido.'),
    body('ia_confianza').isFloat({ min: 0, max: 1 }).withMessage('ia_confianza debe ser entre 0 y 1.'),
    body('score_prioridad').isFloat({ min: 0, max: 100 }).withMessage('score_prioridad debe ser entre 0 y 100.'),
  ],
  validate,
  (req, res) => {
    res.status(501).json({ message: 'Endpoint en construcción.' });
  }
);

export default router;
