from flask import Blueprint

user_create_api_blueprint = Blueprint('user_create_api', __name__)

from . import routes