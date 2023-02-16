from flask import jsonify
from flask_jwt_extended import jwt_required
from . import user_read_api_blueprint
from ..models import User


@user_read_api_blueprint.route('/user/list', methods=['GET'])
@jwt_required()
def user_list():
    users = []
    for row in User.query.all():
        users.append(row.to_json())
    response = jsonify({'users': users})
    return response


@user_read_api_blueprint.route('/healthcheck', methods=['GET'])
def health_check():
    return 'ok'
