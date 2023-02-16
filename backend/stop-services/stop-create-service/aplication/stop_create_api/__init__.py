from flask import Blueprint

stop_create_api_blueprint = Blueprint('stop_create_api', __name__)

from . import routes