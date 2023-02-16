from flask import Blueprint

timetable_update_api_blueprint = Blueprint('timetable_update_api', __name__)

from . import routes