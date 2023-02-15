from flask import Blueprint

timetable_api_blueprint = Blueprint('timetable_api', __name__)

from . import routes