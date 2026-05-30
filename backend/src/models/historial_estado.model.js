import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const HistorialEstado = sequelize.define('HistorialEstado', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  expediente_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  estado_anterior: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  estado_nuevo: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },
  usuario_id: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  observacion: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  fecha: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  }
}, {
  tableName: 'historial_estados',
  timestamps: false,
});

export default HistorialEstado;
