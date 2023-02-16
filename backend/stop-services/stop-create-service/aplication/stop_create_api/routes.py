from flask import jsonify, request
from flask_jwt_extended import jwt_required
from .. import db
from . import stop_create_api_blueprint
from ..models import Stop, StopTimetable, Timetable


@stop_create_api_blueprint.route('/stop/add', methods=['POST'])
@jwt_required()
def stop_add():
    if 'name' not in request.json or 'description' not in request.json or 'image' not in request.json or 'latitude' not in request.json or 'longitude' not in request.json or 'timetableIds' not in request.json:
        response = jsonify({'message': 'Todos los campos son requeridos para crear el paradero.'})
        response.status_code = 400
        return response

    name = request.json['name']
    description = request.json['description']
    image = request.json['image']
    latitude = request.json['latitude']
    longitude = request.json['longitude']
    timetable_ids = request.json['timetableIds']
    
    for timetable_id in timetable_ids:
        timetable_exist = Timetable.query.get(timetable_id)

        if timetable_exist is None:
            response = jsonify({'message': 'El horario con id '+str(timetable_id)+' no existe.'})
            response.status_code = 400
            return response

    stop = Stop()
    stop.name = name
    stop.description = description
    stop.image = image
    stop.latitude = latitude
    stop.longitude = longitude

    db.session.add(stop)
    db.session.commit()

    for timetable_id in timetable_ids:
        stop_timetable = StopTimetable()
        stop_timetable.stop_id = stop.id
        stop_timetable.timetable_id = timetable_id

        db.session.add(stop_timetable)
        db.session.commit()

    response = jsonify({'message': 'Paradero añadido.',
                        'stop': stop.to_json()
                        })
    return response


@stop_create_api_blueprint.route('/healthcheck', methods=['GET'])
def healthcheck():
    return "OK"
