import 'dotenv/config';
import app from './app.js';
import sequelize from './config/db.js';

// Importar modelos
import './models/usuario.model.js';

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos establecida con Sequelize.');
    
    // Sincronizar modelos con la base de datos (crea tablas si no existen)
    await sequelize.sync();
    console.log('✅ Modelos sincronizados con la base de datos.');

    app.listen(PORT, () => {
      console.log(`🚀 SGDML API Gateway corriendo en http://localhost:${PORT}`);
      console.log(`   Entorno: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('❌ Error al conectar a la base de datos:', error);
  }
};

startServer();
