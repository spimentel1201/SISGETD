import { Usuario, Area } from '../models/index.js';

// GET /api/usuarios — Solo admin/funcionario puede listar
export const listarUsuarios = async (req, res) => {
  try {
    const { rol } = req.query;
    const whereClause = {};
    if (rol) whereClause.rol = rol;

    const usuarios = await Usuario.findAll({
      where: whereClause,
      attributes: { exclude: ['hash_password'] },
      include: [{ model: Area, attributes: ['id', 'nombre'] }],
      order: [['nombre', 'ASC']]
    });
    res.status(200).json(usuarios);
  } catch (error) {
    console.error('Error al listar usuarios:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

// PATCH /api/usuarios/:id/area — Asignar funcionario a un área
export const asignarArea = async (req, res) => {
  try {
    const { id } = req.params;
    const { area_id } = req.body;

    const usuario = await Usuario.findByPk(id);
    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }
    if (usuario.rol !== 'funcionario') {
      return res.status(400).json({ message: 'Solo se puede asignar área a un funcionario.' });
    }

    if (area_id) {
      const area = await Area.findByPk(area_id);
      if (!area || !area.es_activo) {
        return res.status(404).json({ message: 'El área no existe o está inactiva.' });
      }
    }

    await usuario.update({ area_id: area_id || null });

    const usuarioActualizado = await Usuario.findByPk(id, {
      attributes: { exclude: ['hash_password'] },
      include: [{ model: Area, attributes: ['id', 'nombre'] }]
    });

    res.status(200).json({ message: 'Área asignada correctamente.', usuario: usuarioActualizado });
  } catch (error) {
    console.error('Error al asignar área:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

// PATCH /api/usuarios/:id/desactivar — Borrado lógico de usuario
export const desactivarUsuario = async (req, res) => {
  try {
    const { id } = req.params;

    // No permitir auto-desactivación
    if (id === req.user.id) {
      return res.status(400).json({ message: 'No puedes desactivar tu propia cuenta.' });
    }

    const usuario = await Usuario.findByPk(id);
    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }

    await usuario.update({ es_activo: false });
    res.status(200).json({ message: 'Usuario desactivado correctamente.' });
  } catch (error) {
    console.error('Error al desactivar usuario:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

// PATCH /api/usuarios/:id/reactivar
export const reactivarUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const usuario = await Usuario.findByPk(id);
    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }

    await usuario.update({ es_activo: true });
    res.status(200).json({ message: 'Usuario reactivado correctamente.' });
  } catch (error) {
    console.error('Error al reactivar usuario:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};
