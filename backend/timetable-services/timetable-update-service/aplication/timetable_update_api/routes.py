from flask import jsonify, request
from flask_jwt_extended import jwt_required
from .. import db
from . import timetable_update_api_blueprint
from ..models import Timetable


@timetable_update_api_blueprint.route('/timetable/update/<int:id>', methods=['PUT'])
@jwt_required()
def timetable_update(id):
    timetable = Timetable.query.get(id)

    if timetable is None:
        response = jsonify({'message': 'Este horario no existe.'})
        response.status_code = 400
        return response

    if not request.json:
        response = jsonify({'message': 'Se debe proporcionar al menos un campo para actualizar el horario.'})
        response.status_code = 400
        return response

    if 'hour' in request.json:
        existing_hour = Timetable.query.filter_by(hour=request.json['hour']).first()
        if existing_hour is not None:
            response = jsonify({'message': 'La hora ya existe. No se puede actualizar el horario.'})
            response.status_code = 409
            return response
        timetable.hour = request.json['hour']

    db.session.commit()

    response = jsonify({'message': 'Horario actualizado.',
                        'timetable': timetable.to_json()
                        })
    return response


@timetable_update_api_blueprint.route('/healthcheck', methods=['GET'])
def healthcheck():
    return "OK"
