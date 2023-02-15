import hashlib
from flask import jsonify, request
from .. import db
from . import user_create_api_blueprint
from ..models import User


@user_create_api_blueprint.route('/user/add', methods=['POST'])
def user_add():
    if 'firstName' not in request.json or 'lastName' not in request.json or 'username' not in request.json or 'password' not in request.json:
        response = jsonify({'message': 'Todos los campos son requeridos para crear al usuario.'})
        response.status_code = 400
        return response

    first_name = request.json['firstName']
    last_name = request.json['lastName']
    username = request.json['username']
    password = request.json['password']
    
    existing_user = User.query.filter_by(username=username).first()
    if existing_user is not None:
        response = jsonify({'message': 'El nombre de usuario ya existe. No se puede crear el usuario.'})
        response.status_code = 409
        return response

    user = User()
    user.first_name = first_name
    user.last_name = last_name
    user.username = username
    user.password = hashlib.sha256(password.encode('utf-8')).hexdigest()

    db.session.add(user)
    db.session.commit()

    response = jsonify({'message': 'Usuario añadido.',
                        'user': {
                            'id': user.id,
                            'firstName': user.first_name,
                            'lastName': user.last_name,
                            'username': user.username
                            }
                        })
    return response


@user_create_api_blueprint.route('/healthcheck', methods=['GET'])
def health_check():
    return 'ok'
