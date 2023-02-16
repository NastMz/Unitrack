from flask import Blueprint

login_api_blueprint = Blueprint('login_api', __name__)

from . import routes