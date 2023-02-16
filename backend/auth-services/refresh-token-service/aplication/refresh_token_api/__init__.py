from flask import Blueprint

refresh_token_api_blueprint = Blueprint('refresh_token_api', __name__)

from . import routes