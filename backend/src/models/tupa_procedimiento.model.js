import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const TupaProcedimiento = sequelize.define('TupaProcedimiento', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  codigo_tupa: {
    type: DataTypes.STRING(30),
    allowNull: false,
    unique: true,
  },
  nombre_tramite: {
    type: DataTypes.STRING(200),
    allowNull: false,
  },
  dias_plazo_legal: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  tipo_silencio: {
    type: DataTypes.ENUM('positivo', 'negativo', 'automatico'),
    allowNull: false,
  },
  area_responsable_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  es_activo: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  }
}, {
  tableName: 'tupa_procedimientos',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

export default TupaProcedimiento;
