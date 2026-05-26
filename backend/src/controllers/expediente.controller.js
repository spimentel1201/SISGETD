import { Expediente, HistorialEstado, Usuario, Area, TupaProcedimiento } from '../models/index.js';
import { publishMessage } from '../services/rabbitmq.service.js';
import { Op } from 'sequelize';
import sequelize from '../config/db.js';

// Generar número de expediente secuencial (EXP-YYYY-XXXX)
const generarNumeroExpediente = async () => {
  const currentYear = new Date().getFullYear();
  // Contar expedientes del año actual para secuenciar
  const count = await Expediente.count({
    where: {
      numero_expediente: {
        [Op.like]: `EXP-${currentYear}-%`
      }
    }
  });
  const secuencia = (count + 1).toString().padStart(4, '0');
  return `EXP-${currentYear}-${secuencia}`;
};

export const crearExpediente = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { tupa_id, asunto } = req.body;
    const usuario_id = req.user.id; 
    const archivo_url = req.file ? req.file.path : null; 

    const numero_expediente = await generarNumeroExpediente();

    const nuevoExpediente = await Expediente.create({
      numero_expediente,
      usuario_id,
      tupa_id,
      estado: 'en_validacion',
      archivo_url,
      fecha_ingreso: new Date()
    }, { transaction: t });

    // Crear historial inmutable
    await HistorialEstado.create({
      expediente_id: nuevoExpediente.id,
      estado_anterior: null,
      estado_nuevo: 'en_validacion',
      usuario_id,
      observacion: `Ingreso de trámite ciudadano. Asunto: ${asunto}`
    }, { transaction: t });

    await t.commit();

    // Enviar evento asíncrono al mock de RabbitMQ
    await publishMessage('expedientes.procesar', {
      expediente_id: nuevoExpediente.id,
      archivo_url
    });

    res.status(201).json({
      message: 'Trámite recibido correctamente.',
      numero_expediente,
      expediente_id: nuevoExpediente.id
    });
  } catch (error) {
    await t.rollback();
    console.error('Error al crear expediente:', error);
    res.status(500).json({ message: 'Error interno del servidor al crear el expediente.' });
  }
};

export const obtenerExpedientes = async (req, res) => {
  try {
    const { rol, area_id } = req.user;
    let whereClause = {};

    // Si es funcionario, filtramos por su área (según regla S07)
    if (rol === 'funcionario' && area_id) {
      whereClause.area_asignada_id = area_id;
    }

    if (req.query.estado) {
      whereClause.estado = req.query.estado;
    }

    const expedientes = await Expediente.findAll({
      where: whereClause,
      include: [
        { model: Usuario, as: 'ciudadano', attributes: ['id', 'nombre', 'dni', 'email'] },
        { model: Area, as: 'area_asignada', attributes: ['id', 'nombre'] },
        { model: TupaProcedimiento, attributes: ['id', 'nombre_tramite'] }
      ],
      order: [
        ['score_prioridad', 'DESC NULLS LAST'],
        ['fecha_ingreso', 'ASC']
      ]
    });

    res.json(expedientes);
  } catch (error) {
    console.error('Error al listar expedientes:', error);
    res.status(500).json({ message: 'Error interno del servidor al listar expedientes.' });
  }
};

export const obtenerExpedientePorId = async (req, res) => {
  try {
    const { id } = req.params;
    const expediente = await Expediente.findByPk(id, {
      include: [
        { model: Usuario, as: 'ciudadano', attributes: ['id', 'nombre', 'dni', 'email'] },
        { model: Area, as: 'area_asignada', attributes: ['id', 'nombre', 'gerencia'] },
        { model: TupaProcedimiento, attributes: ['id', 'nombre_tramite', 'codigo_tupa'] },
        { 
          model: HistorialEstado, 
          as: 'historial',
          include: [{ model: Usuario, as: 'actor', attributes: ['id', 'nombre', 'rol'] }]
        }
      ],
      order: [[{ model: HistorialEstado, as: 'historial' }, 'fecha', 'DESC']]
    });

    if (!expediente) {
      return res.status(404).json({ message: 'Expediente no encontrado.' });
    }

    res.json(expediente);
  } catch (error) {
    console.error('Error al obtener el expediente:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

export const obtenerEstadoExpediente = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Puede buscarse por id (UUID) o numero_expediente
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
    
    const whereClause = isUUID ? { id } : { numero_expediente: id };

    const expediente = await Expediente.findOne({
      where: whereClause,
      attributes: ['id', 'numero_expediente', 'estado', 'fecha_ingreso', 'fecha_limite'],
      include: [
        { model: Area, as: 'area_asignada', attributes: ['nombre'] },
        { 
          model: HistorialEstado, 
          as: 'historial',
          attributes: ['estado_nuevo', 'fecha', 'observacion']
        }
      ],
      order: [[{ model: HistorialEstado, as: 'historial' }, 'fecha', 'DESC']]
    });

    if (!expediente) {
      return res.status(404).json({ message: 'Expediente no encontrado.' });
    }

    res.json(expediente);
  } catch (error) {
    console.error('Error al obtener el estado del expediente:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

export const actualizarEstadoExpediente = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { id } = req.params;
    const { nuevo_estado, observacion, area_asignada_id } = req.body;
    const usuario_id = req.user.id;

    const expediente = await Expediente.findByPk(id, { transaction: t });
    if (!expediente) {
      await t.rollback();
      return res.status(404).json({ message: 'Expediente no encontrado.' });
    }

    const estadoAnterior = expediente.estado;

    // Actualizar campos del expediente
    if (nuevo_estado) expediente.estado = nuevo_estado;
    if (area_asignada_id) expediente.area_asignada_id = area_asignada_id;
    if (nuevo_estado === 'resuelto') expediente.fecha_resolucion = new Date();
    
    await expediente.save({ transaction: t });

    // Registrar en el historial inmutable
    if (nuevo_estado && nuevo_estado !== estadoAnterior) {
      await HistorialEstado.create({
        expediente_id: id,
        estado_anterior: estadoAnterior,
        estado_nuevo: nuevo_estado,
        usuario_id,
        observacion: observacion || `Estado actualizado a ${nuevo_estado}`
      }, { transaction: t });
    } else if (observacion) {
      // Si solo agrega observación sin cambiar estado
      await HistorialEstado.create({
        expediente_id: id,
        estado_anterior: estadoAnterior,
        estado_nuevo: estadoAnterior,
        usuario_id,
        observacion
      }, { transaction: t });
    }

    await t.commit();
    res.json({ message: 'Expediente actualizado correctamente.', expediente });
  } catch (error) {
    await t.rollback();
    console.error('Error al actualizar expediente:', error);
    res.status(500).json({ message: 'Error interno del servidor al actualizar el expediente.' });
  }
};
