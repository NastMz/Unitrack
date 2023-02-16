import config
import os
from datetime import timedelta
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager

db = SQLAlchemy()


def create_app():
    app = Flask(__name__)

    enviroment_configuration = config.DevelopmentConfig

    app.config.from_object(enviroment_configuration)

    app.config['JWT_SECRET_KEY'] = os.getenv("JWT_SECRET_KEY")
    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=1)
    app.config['JWT_REFRESH_TOKEN_EXPIRES'] = timedelta(days=7)

    jwt = JWTManager(app)

    db.init_app(app)

    with app.app_context():
        # Definir la API con blueprints
        from aplication.stop_update_api import stop_update_api_blueprint
        app.register_blueprint(stop_update_api_blueprint)
        return app
