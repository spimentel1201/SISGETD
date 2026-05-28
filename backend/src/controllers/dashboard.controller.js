import { Expediente, Area } from '../models/index.js';
import { Op } from 'sequelize';
import sequelize from '../config/db.js';

export const getKPIs = async (req, res) => {
  try {
    const totalExpedientes = await Expediente.count();
    
    // Carga por área
    const cargaPorArea = await Expediente.findAll({
      attributes: [
        'area_asignada_id',
        [sequelize.fn('COUNT', sequelize.col('id')), 'total']
      ],
      include: [{ model: Area, as: 'area_asignada', attributes: ['nombre'] }],
      group: ['area_asignada_id', 'area_asignada.id']
    });

    // Expedientes resueltos para calcular tiempos (simplificado para MVP)
    const resueltos = await Expediente.findAll({
      where: { estado: 'resuelto' },
      attributes: ['fecha_ingreso', 'fecha_resolucion']
    });

    let tiempoPromedioDias = 0;
    if (resueltos.length > 0) {
      const diffs = resueltos.map(exp => {
        const ingreso = new Date(exp.fecha_ingreso).getTime();
        const resolucion = new Date(exp.fecha_resolucion).getTime();
        return (resolucion - ingreso) / (1000 * 60 * 60 * 24);
      });
      tiempoPromedioDias = diffs.reduce((a, b) => a + b, 0) / diffs.length;
    }

    res.json({
      totalExpedientes,
      tiempoPromedioResolucionDias: Math.round(tiempoPromedioDias * 10) / 10,
      cargaPorArea
    });
  } catch (error) {
    console.error('Error al obtener KPIs:', error);
    res.status(500).json({ message: 'Error interno al calcular KPIs.' });
  }
};

export const getExpedientesCriticos = async (req, res) => {
  try {
    const { rol, area_id } = req.user;
    
    // 3 días en milisegundos
    const tresDiasMs = 3 * 24 * 60 * 60 * 1000;
    const umbralVencimiento = new Date(Date.now() + tresDiasMs);

    let whereClause = {
      estado: {
        [Op.notIn]: ['resuelto', 'archivado']
      },
      fecha_limite: {
        [Op.lte]: umbralVencimiento
      }
    };

    if (rol === 'funcionario' && area_id) {
      whereClause.area_asignada_id = area_id;
    }

    const expedientesCriticos = await Expediente.findAll({
      where: whereClause,
      include: [
        { model: Area, as: 'area_asignada', attributes: ['nombre'] }
      ],
      order: [['fecha_limite', 'ASC']]
    });

    res.json(expedientesCriticos);
  } catch (error) {
    console.error('Error al obtener expedientes críticos:', error);
    res.status(500).json({ message: 'Error interno al obtener expedientes críticos.' });
  }
};
