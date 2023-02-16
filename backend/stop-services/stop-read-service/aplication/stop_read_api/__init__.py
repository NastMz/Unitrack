from flask import Blueprint

stop_read_api_blueprint = Blueprint('stop_read_api', __name__)

from . import routes