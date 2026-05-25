from flask_jwt_extended import get_jwt_identity


def get_jwt_user_id():
    user = get_jwt_identity()
    if isinstance(user, (list, tuple)):
        return user[0]
    return user
