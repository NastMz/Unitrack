from flask import jsonify

from . import stop_timetable_api_blueprint
from ..models import StopTimetable


@stop_timetable_api_blueprint.route('/stop-timetable/stops/<int:timetable_id>', methods=['GET'])
def stops_ids(timetable_id):
    stops = [row.to_json() for row in StopTimetable.query.filter_by(timetable_id=timetable_id).all()]

    response = jsonify({'stops': stops})
    return response


@stop_timetable_api_blueprint.route('/healthcheck', methods=['GET'])
def healthcheck():
    return "OK"
