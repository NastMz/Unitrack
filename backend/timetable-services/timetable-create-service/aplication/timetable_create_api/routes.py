from flask import jsonify, request
from .. import db
from . import timetable_create_api_blueprint
from ..models import Timetable


@timetable_create_api_blueprint.route('/timetable/add', methods=['POST'])
def timetable_add():
    if 'hour' not in request.json:
        response = jsonify({'message': 'La hora es requerida para crear el horario.'})
        response.status_code = 400
        return response

    hour = request.json['hour']
    
    existing_hour = Timetable.query.filter_by(hour=hour).first()
    if existing_hour is not None:
        response = jsonify({'message': 'La hora ya existe. No se puede crear el horario.'})
        response.status_code = 409
        return response

    timetable = Timetable()
    timetable.hour = hour

    db.session.add(timetable)
    db.session.commit()

    response = jsonify({'message': 'Horario añadido.',
                        'timetable': timetable.to_json()
                        })
    return response


@timetable_create_api_blueprint.route('/healthcheck', methods=['GET'])
def healthcheck():
    return "OK"
