from flask import jsonify
from flask_jwt_extended import jwt_required, create_access_token, create_refresh_token, get_jwt_identity
from . import refresh_token_api_blueprint


@refresh_token_api_blueprint.route('/refresh-token', methods=['POST'])
@jwt_required(refresh=True)
def refresh_token():
    current_user = get_jwt_identity()
    new_access_token = create_access_token(identity=current_user)
    new_refresh_token = create_refresh_token(identity=current_user)

    response = jsonify({'access_token': new_access_token,
                        'refresh_token': new_refresh_token})
    response.status_code = 200
    return response


@refresh_token_api_blueprint.route('/healthcheck', methods=['GET'])
def health_check():
    return 'ok'
