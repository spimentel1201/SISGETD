import { TupaProcedimiento, Area } from '../models/index.js';

export const registrarTupa = async (req, res) => {
  try {
    const { codigo_tupa, nombre_tramite, dias_plazo_legal, tipo_silencio, area_responsable_id } = req.body;

    if (!codigo_tupa || !nombre_tramite || !dias_plazo_legal || !tipo_silencio || !area_responsable_id) {
      return res.status(400).json({ message: 'Todos los campos son obligatorios.' });
    }

    const area = await Area.findByPk(area_responsable_id);
    if (!area || !area.es_activo) {
      return res.status(404).json({ message: 'El área responsable no existe o está inactiva.' });
    }

    const existe = await TupaProcedimiento.findOne({ where: { codigo_tupa } });
    if (existe) {
      return res.status(409).json({ message: `Ya existe un trámite con el código TUPA '${codigo_tupa}'.` });
    }

    const tupa = await TupaProcedimiento.create({
      codigo_tupa, nombre_tramite, dias_plazo_legal, tipo_silencio, area_responsable_id
    });

    res.status(201).json({ message: 'Procedimiento TUPA registrado correctamente.', tupa });
  } catch (error) {
    console.error('Error al registrar TUPA:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

export const listarTupas = async (req, res) => {
  try {
    const soloActivos = req.query.activos !== 'false';
    const whereClause = soloActivos ? { es_activo: true } : {};

    const tupas = await TupaProcedimiento.findAll({
      where: whereClause,
      include: [{ model: Area, attributes: ['id', 'codigo', 'nombre'] }],
      order: [['nombre_tramite', 'ASC']]
    });
    res.status(200).json(tupas);
  } catch (error) {
    console.error('Error al listar TUPAs:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

export const obtenerTupaPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const tupa = await TupaProcedimiento.findByPk(id, {
      include: [{ model: Area, attributes: ['id', 'codigo', 'nombre'] }]
    });
    if (!tupa) {
      return res.status(404).json({ message: 'Procedimiento TUPA no encontrado.' });
    }
    res.status(200).json(tupa);
  } catch (error) {
    console.error('Error al obtener TUPA:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

export const actualizarTupa = async (req, res) => {
  try {
    const { id } = req.params;
    const { codigo_tupa, nombre_tramite, dias_plazo_legal, tipo_silencio, area_responsable_id } = req.body;

    const tupa = await TupaProcedimiento.findByPk(id);
    if (!tupa) {
      return res.status(404).json({ message: 'Procedimiento TUPA no encontrado.' });
    }

    await tupa.update({ codigo_tupa, nombre_tramite, dias_plazo_legal, tipo_silencio, area_responsable_id });
    res.status(200).json({ message: 'Procedimiento TUPA actualizado correctamente.', tupa });
  } catch (error) {
    console.error('Error al actualizar TUPA:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

// Borrado lógico: desactiva el trámite sin eliminar histórico
export const desactivarTupa = async (req, res) => {
  try {
    const { id } = req.params;
    const tupa = await TupaProcedimiento.findByPk(id);

    if (!tupa) {
      return res.status(404).json({ message: 'Procedimiento TUPA no encontrado.' });
    }

    await tupa.update({ es_activo: false });
    res.status(200).json({ message: 'Procedimiento TUPA desactivado correctamente.' });
  } catch (error) {
    console.error('Error al desactivar TUPA:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};
