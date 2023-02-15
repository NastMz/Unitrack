from flask import jsonify

from . import timetable_api_blueprint
from ..models import Timetable


@timetable_api_blueprint.route('/api/timetables', methods=['GET'])
def timetables():
    timetables_list = []
    for row in Timetable.query.all():
        timetables_list.append(row.to_json())
    response = jsonify({'timetables': timetables_list})
    return response


@timetable_api_blueprint.route('/healthcheck', methods=['GET'])
def healthcheck():
    return "OK"
