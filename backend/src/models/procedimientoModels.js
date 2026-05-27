// modelo para la tabla de procedimientos
/*### `tupa_procedimientos`
| Campo | Tipo | Notas |
|---|---|---|
| `id` | UUID · PK | |
| `codigo_tupa` | VARCHAR(30) · UNIQUE | |
| `nombre_tramite` | VARCHAR(200) | |
| `dias_plazo_legal` | INT | Días hábiles |
| `tipo_silencio` | ENUM | `positivo`, `negativo`, `automatico` |
| `area_responsable_id` | UUID · FK → `areas` | |
 */

import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';
import Area from './area.model.js';

const Procedimiento = sequelize.define('Procedimiento', {

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
    references: {
      model: 'areas',
      key: 'id',
    },
  },

}, {
  tableName: 'tupa_procedimientos',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
});

// Asociación
Procedimiento.belongsTo(Area, {
  foreignKey: 'area_responsable_id',
  as: 'areaResponsable',
});

Area.hasMany(Procedimiento, {
  foreignKey: 'area_responsable_id',
  as: 'procedimientos',
});

export default Procedimiento;