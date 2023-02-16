from flask import jsonify, request
from flask_jwt_extended import jwt_required
from .. import db
from . import stop_update_api_blueprint
from ..models import Stop, StopTimetable, Timetable


@stop_update_api_blueprint.route('/stop/update/<int:id>', methods=['PUT'])
@jwt_required()
def stop_update(id):
    stop = Stop.query.get(id)

    if stop is None:
        response = jsonify({'message': 'Este paradero no existe.'})
        response.status_code = 400
        return response
    
    if not request.json:
        response = jsonify({'message': 'Se debe proporcionar al menos un campo para actualizar el paradero.'})
        response.status_code = 400
        return response

    if 'name' in request.json:
        stop.name = request.json['name']

    if 'description' in request.json:
        stop.description = request.json['description']

    if 'image' in request.json:
        stop.image = request.json['image']

    if 'latitude' in request.json:
        stop.latitude = request.json['latitude']

    if 'longitude' in request.json:
        stop.longitude = request.json['longitude']

    db.session.commit()

    if 'timetableIds' in request.json:
        StopTimetable.query.filter_by(stop_id=stop.id).delete()
        timetable_ids = request.json['timetableIds']

        for timetable_id in timetable_ids:
            timetable_exist = Timetable.query.get(timetable_id)

            if timetable_exist is None:
                response = jsonify({'message': 'El horario con id '+str(timetable_id)+' no existe.'})
                response.status_code = 400
                return response
            
            stop_timetable = StopTimetable()
            stop_timetable.stop_id = stop.id
            stop_timetable.timetable_id = timetable_id

            db.session.add(stop_timetable)
            db.session.commit()

    response = jsonify({'message': 'Paradero actualizado.',
                        'stop': stop.to_json()
                        })
    return response


@stop_update_api_blueprint.route('/healthcheck', methods=['GET'])
def healthcheck():
    return "OK"
