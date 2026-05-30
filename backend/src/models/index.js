import Usuario from './usuario.model.js';
import Area from './area.model.js';
import TupaProcedimiento from './tupa_procedimiento.model.js';
import Expediente from './expediente.model.js';
import HistorialEstado from './historial_estado.model.js';
import Notificacion from './notificacion.model.js';

// Relaciones Usuario - Area
Area.hasMany(Usuario, { foreignKey: 'area_id' });
Usuario.belongsTo(Area, { foreignKey: 'area_id' });

// Relaciones Expediente - Usuario (ciudadano)
Usuario.hasMany(Expediente, { foreignKey: 'usuario_id' });
Expediente.belongsTo(Usuario, { foreignKey: 'usuario_id', as: 'ciudadano' });

// Relaciones Expediente - TupaProcedimiento
TupaProcedimiento.hasMany(Expediente, { foreignKey: 'tupa_id' });
Expediente.belongsTo(TupaProcedimiento, { foreignKey: 'tupa_id' });

// Relaciones Expediente - Area (asignada)
Area.hasMany(Expediente, { foreignKey: 'area_asignada_id' });
Expediente.belongsTo(Area, { foreignKey: 'area_asignada_id', as: 'area_asignada' });

// Relaciones TupaProcedimiento - Area
Area.hasMany(TupaProcedimiento, { foreignKey: 'area_responsable_id' });
TupaProcedimiento.belongsTo(Area, { foreignKey: 'area_responsable_id' });

// Relaciones HistorialEstado - Expediente
Expediente.hasMany(HistorialEstado, { foreignKey: 'expediente_id', as: 'historial' });
HistorialEstado.belongsTo(Expediente, { foreignKey: 'expediente_id' });

// Relaciones HistorialEstado - Usuario (actor)
Usuario.hasMany(HistorialEstado, { foreignKey: 'usuario_id' });
HistorialEstado.belongsTo(Usuario, { foreignKey: 'usuario_id', as: 'actor' });

// Relaciones Notificacion - Expediente
Expediente.hasMany(Notificacion, { foreignKey: 'expediente_id' });
Notificacion.belongsTo(Expediente, { foreignKey: 'expediente_id' });

// Relaciones Notificacion - Usuario
Usuario.hasMany(Notificacion, { foreignKey: 'usuario_id' });
Notificacion.belongsTo(Usuario, { foreignKey: 'usuario_id' });

export {
  Usuario,
  Area,
  TupaProcedimiento,
  Expediente,
  HistorialEstado,
  Notificacion
};
