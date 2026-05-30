# SISGETD - Backend API (SGDML)

Este es el backend del Sistema de Gestión Documental con Machine Learning (SGDML), construido con **Node.js, Express y PostgreSQL**. Expone una API RESTFul completa para gestionar el flujo de expedientes, usuarios, áreas y procedimientos, integrándose también con un servicio de Machine Learning.

## Tecnologías Principales

* **Node.js & Express:** Framework para el servidor y enrutamiento.
* **Sequelize (ORM):** Interacción con la base de datos PostgreSQL.
* **PostgreSQL:** Base de datos relacional principal.
* **JSON Web Tokens (JWT):** Autenticación y autorización basada en roles (`admin`, `funcionario`, `ciudadano`).
* **Nodemailer:** Envío de correos electrónicos (notificaciones).
* **Dotenv:** Gestión de variables de entorno.

## Módulos de la API

La API está dividida en los siguientes dominios principales:

1. **Autenticación (`/api/auth`)**: Registro (admin, ciudadano, funcionario) y Login. Emite tokens JWT.
2. **Áreas (`/api/areas`)**: CRUD de áreas o dependencias de la municipalidad.
3. **TUPA (`/api/tupa`)**: CRUD de los procedimientos TUPA. Están enlazados obligatoriamente a un Área responsable.
4. **Usuarios (`/api/usuarios`)**: Gestión de personal y ciudadanos. Permite asignar áreas a los funcionarios.
5. **Expedientes (`/api/expedientes`)**: Flujo central. Creación de trámites, asignación de documentos, actualización de estados y trazabilidad.
6. **Webhooks (`/api/webhooks`)**: Endpoint para recibir la predicción del microservicio de Python (IA) sobre prioridad y confianza de un expediente.
7. **Dashboard y KPIs (`/api/dashboard`)**: Métricas, tiempos de resolución y expedientes críticos (por vencer).
8. **Notificaciones (`/api/notificaciones`)**: Alertas dirigidas a usuarios sobre cambios de estado.

## Instalación y Ejecución

### 1. Requisitos Previos
* Node.js (v18+)
* PostgreSQL instalado y ejecutándose.

### 2. Configurar el Entorno
Duplica el archivo `.env.example` (si existe) y renómbralo a `.env`. Asegúrate de configurar correctamente tu base de datos:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=sgdml_db
DB_USER=postgres
DB_PASSWORD=tu_password
JWT_SECRET=un_secreto_seguro
```

### 3. Instalar Dependencias
```bash
cd backend
npm install
```

### 4. Iniciar el Servidor

Para entorno de desarrollo (con recarga automática mediante nodemon):
```bash
npm run dev
```

La base de datos (tablas) se sincronizará automáticamente gracias a Sequelize (`alter: true` en desarrollo).

## Semillas (Seeding) de Datos

En la carpeta raíz del proyecto se encuentra un script para poblar la base de datos rápidamente con los procedimientos TUPA preconfigurados enlazados a sus respectivas áreas.

Para correrlo, asegúrate de estar en la carpeta raíz (`SISGETD`) y ejecutar:
```bash
node --env-file=backend/.env seed_tupas.js
```
*(Requiere Node 20.6+ para cargar el .env directo. De forma alternativa, ejecuta `node seed_tupas.js` si el script incluye la carga de dotenv).*

## Pruebas con Postman

En la raíz del proyecto encontrarás el archivo `postman_collection.json`. 
1. Importa este archivo en tu cliente Postman.
2. Sigue el flujo lógico (numerado del 1 al 8).
3. **Importante:** Ejecuta primero la Autenticación (`Auth > Login` o `Register`) para generar el token automáticamente, el cual se guardará y usará en las demás peticiones protegidas.
