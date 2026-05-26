import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Notificacion = sequelize.define('Notificacion', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  expediente_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  usuario_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  canal: {
    type: DataTypes.ENUM('email', 'sms'),
    allowNull: false,
  },
  mensaje: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  enviado: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  fecha_envio: {
    type: DataTypes.DATE,
    allowNull: true,
  }
}, {
  tableName: 'notificaciones',
  timestamps: false,
});

export default Notificacion;
