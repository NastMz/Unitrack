import hashlib
from flask import jsonify, request
from flask_jwt_extended import create_access_token, create_refresh_token
from . import login_api_blueprint
from ..models import User


@login_api_blueprint.route('/login', methods=['POST'])
def login():
    if 'username' not in request.json or 'password' not in request.json:
        response = jsonify({'message': 'Nombre de usuario o contraseña no ingresado.'})
        response.status_code = 400  
        return response
    
    username = request.json['username']
    password = request.json['password']
    
    user = User.query.filter_by(username=username).first()
    
    if user is None:
        response = jsonify({'message': 'Nombre de usuario o contraseña incorrectos.'})
        response.status_code = 401
        return response

    if hashlib.sha256(password.encode('utf-8')).hexdigest() != user.password:
        response = jsonify({'message': 'Nombre de usuario o contraseña incorrectos.'})
        response.status_code = 401
        return response
    
    access_token = create_access_token(identity=username)
    refresh_token = create_refresh_token(identity=username)

    response = jsonify({'access_token': access_token,
                        'refresh_token': refresh_token})
    response.status_code = 200
    return response


@login_api_blueprint.route('/healthcheck', methods=['GET'])
def health_check():
    return 'ok'
