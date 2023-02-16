from flask import Blueprint

stop_delete_api_blueprint = Blueprint('stop_delete_api', __name__)

from . import routes