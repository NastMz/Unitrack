from flask import Blueprint

stop_timetable_api_blueprint = Blueprint('stop_timetable_api', __name__)

from . import routes