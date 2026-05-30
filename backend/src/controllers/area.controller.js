import Area from '../models/area.model.js';

export const registrarArea = async (req, res) => {
  try {
    const { codigo, nombre, gerencia } = req.body;

    if (!codigo || !nombre || !gerencia) {
      return res.status(400).json({ message: 'Los campos codigo, nombre y gerencia son obligatorios.' });
    }

    const existe = await Area.findOne({ where: { codigo } });
    if (existe) {
      return res.status(409).json({ message: `Ya existe un área con el código '${codigo}'.` });
    }

    const nuevaArea = await Area.create({ codigo, nombre, gerencia });
    res.status(201).json({ message: 'Área registrada correctamente.', area: nuevaArea });
  } catch (error) {
    console.error('Error al registrar área:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

export const listarArea = async (req, res) => {
  try {
    const soloActivas = req.query.activas !== 'false';
    const whereClause = soloActivas ? { es_activo: true } : {};

    const areas = await Area.findAll({ where: whereClause, order: [['nombre', 'ASC']] });
    res.status(200).json(areas);
  } catch (error) {
    console.error('Error al listar áreas:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

export const obtenerAreaPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const area = await Area.findByPk(id);
    if (!area) {
      return res.status(404).json({ message: 'Área no encontrada.' });
    }
    res.status(200).json(area);
  } catch (error) {
    console.error('Error al obtener área:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

export const actualizarArea = async (req, res) => {
  try {
    const { id } = req.params;
    const { codigo, nombre, gerencia } = req.body;

    const area = await Area.findByPk(id);
    if (!area) {
      return res.status(404).json({ message: 'Área no encontrada.' });
    }

    await area.update({ codigo, nombre, gerencia });
    res.status(200).json({ message: 'Área actualizada correctamente.', area });
  } catch (error) {
    console.error('Error al actualizar área:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

// Borrado lógico: marca como inactiva, no elimina físicamente
export const eliminarArea = async (req, res) => {
  try {
    const { id } = req.params;
    const area = await Area.findByPk(id);

    if (!area) {
      return res.status(404).json({ message: 'Área no encontrada.' });
    }

    await area.update({ es_activo: false });
    res.status(200).json({ message: 'Área desactivada correctamente.' });
  } catch (error) {
    console.error('Error al desactivar área:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};