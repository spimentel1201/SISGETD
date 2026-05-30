import { Expediente, HistorialEstado } from '../models/index.js';
import sequelize from '../config/db.js';

export const recibirResultadoML = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { expediente_id, tupa_id, area_asignada_id, ia_confianza, score_prioridad } = req.body;

    const expediente = await Expediente.findByPk(expediente_id, { transaction: t });
    if (!expediente) {
      await t.rollback();
      return res.status(404).json({ message: 'Expediente no encontrado.' });
    }

    const estadoAnterior = expediente.estado;
    const nuevoEstado = 'derivado';

    expediente.estado = nuevoEstado;
    expediente.tupa_id = tupa_id;
    expediente.area_asignada_id = area_asignada_id;
    expediente.ia_confianza = ia_confianza;
    expediente.score_prioridad = score_prioridad;

    await expediente.save({ transaction: t });

    // Registrar en el historial inmutable
    await HistorialEstado.create({
      expediente_id,
      estado_anterior: estadoAnterior,
      estado_nuevo: nuevoEstado,
      usuario_id: null, // Se marca como nulo porque la acción fue automática (IA)
      observacion: `Clasificación y derivación automática por IA (Confianza: ${(ia_confianza * 100).toFixed(1)}%).`
    }, { transaction: t });

    await t.commit();

    res.json({ message: 'Expediente procesado y derivado con éxito.', expediente_id });
  } catch (error) {
    await t.rollback();
    console.error('Error procesando webhook de ML:', error);
    res.status(500).json({ message: 'Error interno al procesar webhook.' });
  }
};
