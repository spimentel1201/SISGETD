import { Router } from 'express';
import * as AreaController from '../controllers/area.controller.js';

const router = Router();

router.post(
  '/',
  AreaController.registrarArea
);

router.get(
  '/',
  AreaController.listarArea
);

router.put(
  '/:id',
  AreaController.actualizarArea
);

router.delete(
  '/:id',
  AreaController.eliminarArea
);

export default router;