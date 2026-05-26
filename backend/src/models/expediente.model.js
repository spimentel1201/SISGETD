import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Expediente = sequelize.define('Expediente', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  numero_expediente: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true,
  },
  usuario_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  tupa_id: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  area_asignada_id: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  estado: {
    type: DataTypes.ENUM(
      'ingresado', 'en_validacion', 'requiere_triaje', 'derivado', 
      'en_evaluacion', 'resuelto', 'archivado', 'recibido', 'procesando'
    ),
    allowNull: false,
    defaultValue: 'en_validacion',
  },
  ia_confianza: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  score_prioridad: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  archivo_url: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  fecha_ingreso: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  fecha_limite: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  fecha_resolucion: {
    type: DataTypes.DATE,
    allowNull: true,
  }
}, {
  tableName: 'expedientes',
  timestamps: false,
});

export default Expediente;
