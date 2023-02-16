from flask import jsonify, request
from .. import db
from . import stop_delete_api_blueprint
from ..models import Stop


@stop_delete_api_blueprint.route('/stop/delete/<int:id>', methods=['DELETE'])
def stop_delete(id):
    stop = Stop.query.get(id)

    if stop is None:
        response = jsonify({'message': 'Este paradero no existe.'})
        response.status_code = 400
        return response
    
    db.session.delete(stop)
    db.session.commit()

    response = jsonify({'message': 'Paradero eliminado.',
                        'stop': stop.to_json()
                        })
    return response


@stop_delete_api_blueprint.route('/healthcheck', methods=['GET'])
def healthcheck():
    return "OK"
