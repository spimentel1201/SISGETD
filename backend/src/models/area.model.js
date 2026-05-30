import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Area = sequelize.define('Area', {

  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  codigo: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true,
  },
  nombre: {
    type: DataTypes.STRING(120),
    allowNull: false,
  },
  gerencia: {
    type: DataTypes.STRING(120),
    allowNull: false,
  },
  es_activo: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  }
}, {
  tableName: 'areas',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

export default Area;
