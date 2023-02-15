from flask import jsonify
from .. import db
from . import user_delete_api_blueprint
from ..models import User


@user_delete_api_blueprint.route('/user/delete/<int:id>', methods=['DELETE'])
def user_delete(id):
    user = User.query.get(id)
    if user is None:
        response = jsonify({'message': 'Este usuario no existe.'})
        response.status_code = 400
        return response
    
    db.session.delete(user)
    db.session.commit()

    response = jsonify({'message': 'Usuario eliminado.',
                        'user': {
                            'id': user.id,
                            'firstName': user.first_name,
                            'lastName': user.last_name,
                            'username': user.username
                            }
                        })
    
    return response

    
@user_delete_api_blueprint.route('/healthcheck', methods=['GET'])
def health_check():
    return 'ok'
