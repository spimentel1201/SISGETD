// rutas  de procedimientos operaciones endpoints
import Procedimiento from '../models/procedimiento.model.js';
import Area from '../models/area.model.js';

// GET /api/procedimientos
export const getAll = async (req, res) => {
  try {
    const procedimientos = await Procedimiento.findAll({
      include: [{ model: Area, as: 'areaResponsable', attributes: ['id', 'codigo', 'nombre'] }],
      order: [['created_at', 'DESC']],
    });
    res.status(200).json(procedimientos);
  } catch (error) {
    console.error('Error en getAll procedimientos:', error);
    res.status(500).json({ error: 'Error interno del servidor al obtener los procedimientos.' });
  }
};

// GET /api/procedimientos/:id
export const getById = async (req, res) => {
  try {
    const { id } = req.params;
    const procedimiento = await Procedimiento.findByPk(id, {
      include: [{ model: Area, as: 'areaResponsable', attributes: ['id', 'codigo', 'nombre'] }],
    });

    if (!procedimiento) {
      return res.status(404).json({ error: 'Procedimiento no encontrado.' });
    }

    res.status(200).json(procedimiento);
  } catch (error) {
    console.error('Error en getById procedimiento:', error);
    res.status(500).json({ error: 'Error interno del servidor al obtener el procedimiento.' });
  }
};

// POST /api/procedimientos
export const create = async (req, res) => {
  try {
    const { codigo_tupa, nombre_tramite, dias_plazo_legal, tipo_silencio, area_responsable_id } = req.body;

    const existingCodigo = await Procedimiento.findOne({ where: { codigo_tupa } });
    if (existingCodigo) {
      return res.status(400).json({ error: 'El código TUPA ya está registrado.' });
    }

    const areaExiste = await Area.findByPk(area_responsable_id);
    if (!areaExiste) {
      return res.status(400).json({ error: 'El área responsable indicada no existe.' });
    }

    const nuevo = await Procedimiento.create({
      codigo_tupa,
      nombre_tramite,
      dias_plazo_legal,
      tipo_silencio,
      area_responsable_id,
    });

    res.status(201).json({
      message: 'Procedimiento creado exitosamente.',
      procedimiento: nuevo,
    });
  } catch (error) {
    console.error('Error en create procedimiento:', error);
    res.status(500).json({ error: 'Error interno del servidor al crear el procedimiento.' });
  }
};

// PUT /api/procedimientos/:id
export const update = async (req, res) => {
  try {
    const { id } = req.params;
    const { codigo_tupa, nombre_tramite, dias_plazo_legal, tipo_silencio, area_responsable_id } = req.body;

    const procedimiento = await Procedimiento.findByPk(id);
    if (!procedimiento) {
      return res.status(404).json({ error: 'Procedimiento no encontrado.' });
    }

    if (codigo_tupa && codigo_tupa !== procedimiento.codigo_tupa) {
      const duplicado = await Procedimiento.findOne({ where: { codigo_tupa } });
      if (duplicado) {
        return res.status(400).json({ error: 'El código TUPA ya está en uso por otro procedimiento.' });
      }
    }

    if (area_responsable_id) {
      const areaExiste = await Area.findByPk(area_responsable_id);
      if (!areaExiste) {
        return res.status(400).json({ error: 'El área responsable indicada no existe.' });
      }
    }

    await procedimiento.update({
      codigo_tupa:        codigo_tupa        ?? procedimiento.codigo_tupa,
      nombre_tramite:     nombre_tramite     ?? procedimiento.nombre_tramite,
      dias_plazo_legal:   dias_plazo_legal   ?? procedimiento.dias_plazo_legal,
      tipo_silencio:      tipo_silencio      ?? procedimiento.tipo_silencio,
      area_responsable_id: area_responsable_id ?? procedimiento.area_responsable_id,
    });

    res.status(200).json({
      message: 'Procedimiento actualizado exitosamente.',
      procedimiento,
    });
  } catch (error) {
    console.error('Error en update procedimiento:', error);
    res.status(500).json({ error: 'Error interno del servidor al actualizar el procedimiento.' });
  }
};

// DELETE /api/procedimientos/:id
export const remove = async (req, res) => {
  try {
    const { id } = req.params;

    const procedimiento = await Procedimiento.findByPk(id);
    if (!procedimiento) {
      return res.status(404).json({ error: 'Procedimiento no encontrado.' });
    }

    await procedimiento.destroy();

    res.status(200).json({ message: 'Procedimiento eliminado exitosamente.' });
  } catch (error) {
    console.error('Error en remove procedimiento:', error);
    res.status(500).json({ error: 'Error interno del servidor al eliminar el procedimiento.' });
  }
};