from flask import Blueprint

stop_api_blueprint = Blueprint('stop_api', __name__)

from . import routes