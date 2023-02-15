from flask import Blueprint

user_read_api_blueprint = Blueprint('user_read_api', __name__)

from . import routes