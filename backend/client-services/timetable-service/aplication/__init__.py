import config
from flask import Flask
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()


def create_app():
    app = Flask(__name__)

    enviroment_configuration = config.DevelopmentConfig

    app.config.from_object(enviroment_configuration)

    db.init_app(app)

    with app.app_context():
        # Definir la API con blueprints
        from aplication.timetable_api import timetable_api_blueprint
        app.register_blueprint(timetable_api_blueprint)
        return app
