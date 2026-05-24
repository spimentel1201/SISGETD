# app/__init__.py - Inicialización de la aplicación

from flask import Flask
from flask_cors import CORS
from .extensions import db, mail, jwt, migrate
from .config import Config

def create_app(config_class=Config):
    """Factory para crear la instancia de la aplicación Flask"""
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Inicializar extensiones
    db.init_app(app)
    mail.init_app(app)
    jwt.init_app(app)
    migrate.init_app(app, db)

    # Configurar CORS
    CORS(app, resources={r"/api/*": {"origins": "*"}})

    # Registrar blueprints (módulos de rutas)
    from app.routes.auth import auth_bp
    from app.routes.expediente import expediente_bp
    from app.routes.dashboard import dashboard_bp
    from app.routes.reportes import reportes_bp
    from app.routes.admin import admin_bp

    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(expediente_bp, url_prefix='/api/expedientes')
    app.register_blueprint(dashboard_bp, url_prefix='/api/dashboard')
    app.register_blueprint(reportes_bp, url_prefix='/api/reportes')
    app.register_blueprint(admin_bp, url_prefix='/api/admin')

    # Health check
    @app.route('/health')
    def health_check():
        return {"status": "ok", "service": "backend-python"}

    return app
