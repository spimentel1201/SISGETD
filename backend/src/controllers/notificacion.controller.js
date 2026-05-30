import { Notificacion, Expediente } from '../models/index.js';

export const obtenerMisNotificaciones = async (req, res) => {
  try {
    const usuario_id = req.user.id;

    const notificaciones = await Notificacion.findAll({
      where: { usuario_id },
      include: [
        { model: Expediente, attributes: ['numero_expediente', 'estado'] }
      ],
      order: [['fecha_envio', 'DESC NULLS LAST']]
    });

    res.json(notificaciones);
  } catch (error) {
    console.error('Error al listar notificaciones:', error);
    res.status(500).json({ message: 'Error interno al obtener notificaciones.' });
  }
};

export const marcarComoLeida = async (req, res) => {
  try {
    const { id } = req.params;
    const usuario_id = req.user.id;

    const notificacion = await Notificacion.findOne({ where: { id, usuario_id } });

    if (!notificacion) {
      return res.status(404).json({ message: 'Notificación no encontrada o no pertenece al usuario.' });
    }

    notificacion.leido = true;
    await notificacion.save();

    res.json({ message: 'Notificación marcada como leída.', notificacion });
  } catch (error) {
    console.error('Error al actualizar notificación:', error);
    res.status(500).json({ message: 'Error interno al actualizar notificación.' });
  }
};
