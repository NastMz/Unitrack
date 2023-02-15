from flask import Blueprint

user_update_api_blueprint = Blueprint('user_update_api', __name__)

from . import routes