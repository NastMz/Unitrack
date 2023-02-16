from flask import jsonify
from .. import db
from . import stop_read_api_blueprint
from ..models import Stop, StopTimetable, Timetable


@stop_read_api_blueprint.route('/stop/list', methods=['GET'])
def stop_list():
    query = db.session.query(Stop, Timetable).select_from(Stop).join(StopTimetable).join(Timetable)
    results = query.all()

    def format_result(stop, timetables):
        timetable_list = []
        for timetable in timetables:
            timetable_list.append({
                'id': timetable.id,
                'hour': timetable.hour.strftime('%H:%M:%S')
            })

        return {
            'id': stop.id,
            'name': stop.name,
            'description': stop.description,
            'image': stop.image,
            'coordinates': {
                'lat': stop.latitude,
                'lng': stop.longitude
            },
            'timetables': timetable_list
        }

    stops = []
    current_stop = None
    current_timetables = []
    for result in results:
        stop, timetable = result
        if current_stop is None:
            current_stop = stop
        if stop.id != current_stop.id:
            formatted_result = format_result(current_stop, current_timetables)
            stops.append(formatted_result)
            current_stop = stop
            current_timetables = []
        current_timetables.append(timetable)
    formatted_result = format_result(current_stop, current_timetables)
    stops.append(formatted_result)

    response = jsonify({'stops': stops})
    return response


@stop_read_api_blueprint.route('/healthcheck', methods=['GET'])
def healthcheck():
    return "OK"
