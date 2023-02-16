from flask import jsonify, request
from .. import db
from . import timetable_delete_api_blueprint
from ..models import Timetable


@timetable_delete_api_blueprint.route('/timetable/delete/<int:id>', methods=['DELETE'])
def timetable_delete(id):
    timetable = Timetable.query.get(id)
    if timetable is None:
        response = jsonify({'message': 'Este horario no existe.'})
        response.status_code = 400
        return response
    
    db.session.delete(timetable)
    db.session.commit()

    response = jsonify({'message': 'Horario eliminado.',
                        'timetable': timetable.to_json()
                        })
    return response


@timetable_delete_api_blueprint.route('/healthcheck', methods=['GET'])
def healthcheck():
    return "OK"
