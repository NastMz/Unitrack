import hashlib
from flask import jsonify, request
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
    
    response = jsonify({'message': 'Autenticación exitosa.'})
    response.status_code = 200
    return response


@login_api_blueprint.route('/healthcheck', methods=['GET'])
def health_check():
    return 'ok'
