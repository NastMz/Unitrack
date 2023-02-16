from flask import Blueprint

stop_update_api_blueprint = Blueprint('stop_update_api', __name__)

from . import routes