from flask import Blueprint

user_delete_api_blueprint = Blueprint('user_delete_api', __name__)

from . import routes