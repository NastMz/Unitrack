from flask import Blueprint

timetable_delete_api_blueprint = Blueprint('timetable_delete_api', __name__)

from . import routes