import hashlib
from flask import jsonify, request
from .. import db
from . import user_update_api_blueprint
from ..models import User


@user_update_api_blueprint.route('/user/update/<int:id>', methods=['PUT'])
def user_update(id):
    user = User.query.get(id)
    
    if user is None:
        response = jsonify({'message': 'Este usuario no existe.'})
        response.status_code = 400
        return response

    if not request.json:
        response = jsonify({'message': 'Se debe proporcionar al menos un campo para actualizar el usuario.'})
        response.status_code = 400
        return response

    if 'firstName' in request.json:
        user.first_name = request.json['firstName']

    if 'lastName' in request.json:
        user.last_name = request.json['lastName']

    if 'username' in request.json:
        existing_user = User.query.filter_by(username=request.json['username']).first()
        if existing_user is not None and existing_user.id != id:
            response = jsonify({'message': 'El nombre de usuario ya existe. No se puede usar este nombre de usuario.'})
            response.status_code = 409
            return response
        user.username = request.json['username']

    if 'password' in request.json:
        user.password = hashlib.sha256(request.json['password'].encode('utf-8')).hexdigest()

    db.session.commit()

    response = jsonify({'message': 'Usuario actualizado.',
                        'user': {
                            'id': user.id,
                            'firstName': user.first_name,
                            'lastName': user.last_name,
                            'username': user.username
                            }
                        })
    return response

    
@user_update_api_blueprint.route('/healthcheck', methods=['GET'])
def health_check():
    return 'ok'
