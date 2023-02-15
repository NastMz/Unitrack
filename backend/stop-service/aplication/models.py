from . import db


class Stop(db.Model):
    __tablename__ = "stop"
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), unique=False, nullable=False)
    description = db.Column(db.String(255), unique=False, nullable=False)
    image = db.Column(db.String(255), unique=False, nullable=True)
    latitude = db.Column(db.Float, unique=False, nullable=False)
    longitude = db.Column(db.Float, unique=False, nullable=False)

    def to_json(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'image': self.image,
            'coordinates': {
                'lat': self.latitude,
                'lng': self.longitude
            }
        }
