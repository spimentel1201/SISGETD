import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
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

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await Usuario.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Credenciales inválidas.' });
    }

    if (!user.es_activo) {
      return res.status(403).json({ error: 'Usuario desactivado. Contacte al administrador.' });
    }

    const isMatch = await bcrypt.compare(password, user.hash_password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Credenciales inválidas.' });
    }

    const payload = {
      id: user.id,
      rol: user.rol,
      area_id: user.area_id
    };

    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET || 'secret_key_mock_mvp',
      { expiresIn: '8h' }
    );

    res.json({
      message: 'Inicio de sesión exitoso',
      token,
      usuario: {
        id: user.id,
        nombre: user.nombre,
        email: user.email,
        rol: user.rol,
        area_id: user.area_id
      }
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error interno del servidor al iniciar sesión.' });
  }
};
