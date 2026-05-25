import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Usuario = sequelize.define('Usuario', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  dni: {
    type: DataTypes.STRING(11),
    allowNull: false,
    unique: true,
  },
  nombre: {
    type: DataTypes.STRING(120),
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING(120),
    allowNull: false,
    unique: true,
  },
  rol: {
    type: DataTypes.ENUM('ciudadano', 'funcionario', 'admin'),
    defaultValue: 'ciudadano',
  },
  area_id: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  hash_password: {
    type: DataTypes.TEXT,
    allowNull: false,
  }
}, {
  tableName: 'usuarios',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

export default Usuario;
