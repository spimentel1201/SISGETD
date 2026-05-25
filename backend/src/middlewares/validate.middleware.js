import { validationResult } from 'express-validator';

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      error: 'Error de validación.',
      detalles: errors.array().map((e) => ({
        campo: e.path,
        mensaje: e.msg,
      })),
    });
  }
  next();
};

export default validate;
