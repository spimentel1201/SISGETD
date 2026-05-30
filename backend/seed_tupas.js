import dotenv from 'dotenv';
dotenv.config();

import TupaProcedimiento from './src/models/tupa_procedimiento.model.js';
import sequelize from './src/config/db.js';

const tupas = [
  {
    codigo_tupa: 'DOC-001',
    nombre_tramite: 'Formulario Unico de Tramite (FUT) o Solicitud Simple',
    dias_plazo_legal: 1,
    tipo_silencio: 'automatico',
    area_responsable_id: '99ec2363-70e0-4ac7-a4c9-1621d5f812a9' // Secretaría General (Trámite Documentario)
  },
  {
    codigo_tupa: 'DOC-002',
    nombre_tramite: 'Oficios y Cartas de Instituciones Externas',
    dias_plazo_legal: 0,
    tipo_silencio: 'automatico',
    area_responsable_id: '5aeac95f-4f74-4e9e-a138-92d0158a6dcc' // Alcaldía
  },
  {
    codigo_tupa: 'TUP-001',
    nombre_tramite: 'Licencia de Funcionamiento - Nivel de riesgo bajo',
    dias_plazo_legal: 2,
    tipo_silencio: 'automatico',
    area_responsable_id: '9094a739-9f22-4dc6-ba76-d583fee4d191' // Gerencia de Desarrollo Económico
  },
  {
    codigo_tupa: 'TUP-002',
    nombre_tramite: 'Licencia de Funcionamiento - Nivel de riesgo alto o muy alto',
    dias_plazo_legal: 8,
    tipo_silencio: 'positivo',
    area_responsable_id: '9094a739-9f22-4dc6-ba76-d583fee4d191' // Gerencia de Desarrollo Económico
  },
  {
    codigo_tupa: 'TUP-003',
    nombre_tramite: 'Inspeccion Tecnica de Seguridad en Edificaciones (ITSE)',
    dias_plazo_legal: 7,
    tipo_silencio: 'positivo',
    area_responsable_id: '0448dd7c-46fc-4fdc-98dd-be55e2700bb5' // GSPGA (o crear nueva área para Defensa Civil)
  },
  {
    codigo_tupa: 'TUP-004',
    nombre_tramite: 'Licencia de Edificacion Modalidad A',
    dias_plazo_legal: 1,
    tipo_silencio: 'automatico',
    area_responsable_id: 'ecf3abf0-8627-4a55-b9ce-3e2a143f7f97' // Gerencia de Desarrollo Urbano
  },
  {
    codigo_tupa: 'TUP-005',
    nombre_tramite: 'Licencia de Edificacion Modalidad B, C y D',
    dias_plazo_legal: 15,
    tipo_silencio: 'negativo',
    area_responsable_id: 'ecf3abf0-8627-4a55-b9ce-3e2a143f7f97' // Gerencia de Desarrollo Urbano
  },
  {
    codigo_tupa: 'TUP-006',
    nombre_tramite: 'Constancia de posesion de terrenos',
    dias_plazo_legal: 15,
    tipo_silencio: 'negativo',
    area_responsable_id: 'ecf3abf0-8627-4a55-b9ce-3e2a143f7f97' // Gerencia de Desarrollo Urbano (Catastro)
  },
  {
    codigo_tupa: 'TUP-007',
    nombre_tramite: 'Licencia de Conducir para Vehiculos Menores Motorizados',
    dias_plazo_legal: 5,
    tipo_silencio: 'positivo',
    area_responsable_id: 'ecf3abf0-8627-4a55-b9ce-3e2a143f7f97' // Gerencia de Desarrollo Urbano (Transporte)
  },
  {
    codigo_tupa: 'TUP-008',
    nombre_tramite: 'Nulidad de papeletas de infracciones de transito',
    dias_plazo_legal: 30,
    tipo_silencio: 'negativo',
    area_responsable_id: '7a6bb509-a9ae-4e79-8211-563ef25ffbd0' // Gerencia de Administración Tributaria
  },
  {
    codigo_tupa: 'TUP-009',
    nombre_tramite: 'Inscripcion de actas de nacimiento',
    dias_plazo_legal: 1,
    tipo_silencio: 'automatico',
    area_responsable_id: '99ec2363-70e0-4ac7-a4c9-1621d5f812a9' // Secretaría General (Registro Civil)
  },
  {
    codigo_tupa: 'TUP-010',
    nombre_tramite: 'Suspension de cobranza coactiva',
    dias_plazo_legal: 15,
    tipo_silencio: 'positivo',
    area_responsable_id: '7a6bb509-a9ae-4e79-8211-563ef25ffbd0' // Gerencia de Administración Tributaria
  }
];

async function seedTupas() {
  try {
    await sequelize.authenticate();
    console.log('Conectado a la BD.');
    
    // Insertar ignorando duplicados si se vuelve a correr
    for (const tupa of tupas) {
      const [record, created] = await TupaProcedimiento.findOrCreate({
        where: { codigo_tupa: tupa.codigo_tupa },
        defaults: tupa
      });
      if (created) {
        console.log(`✅ Creado: ${tupa.codigo_tupa} - ${tupa.nombre_tramite}`);
      } else {
        console.log(`⚠️ Ya existía: ${tupa.codigo_tupa}`);
      }
    }
    
    console.log('¡Seeding de TUPAs completado!');
    process.exit(0);
  } catch (error) {
    console.error('Error durante el seeding:', error);
    process.exit(1);
  }
}

seedTupas();
