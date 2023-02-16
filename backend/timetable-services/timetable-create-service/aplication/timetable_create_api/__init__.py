from flask import Blueprint

timetable_create_api_blueprint = Blueprint('timetable_create_api', __name__)

from . import routes