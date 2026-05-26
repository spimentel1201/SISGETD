import bcrypt from 'bcryptjs';
import Usuario from '../models/usuario.model.js';

export const register = async (req, res) => {
  try {
    const { dni, nombre, email, password, rol, area_id } = req.body;

    const existingEmail = await Usuario.findOne({ where: { email } });
    if (existingEmail) {
      return res.status(400).json({ error: 'El correo electrónico ya está registrado.' });
    }

    const existingDni = await Usuario.findOne({ where: { dni } });
    if (existingDni) {
      return res.status(400).json({ error: 'El DNI o RUC ya está registrado.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hash_password = await bcrypt.hash(password, salt);

    const newUser = await Usuario.create({
      dni,
      nombre,
      email,
      hash_password,
      rol: rol || 'ciudadano',
      area_id: area_id || null
    });

    const userResponse = newUser.toJSON();
    delete userResponse.hash_password;

    res.status(201).json({
      message: 'Usuario registrado exitosamente',
      usuario: userResponse
    });
  } catch (error) {
    console.error('Error en register:', error);
    res.status(500).json({ error: 'Error interno del servidor al registrar el usuario.' });
  }
};