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


class StopTimetable(db.Model):
    __tablename__ = "stop_timetable"
    stop_id = db.Column(db.Integer, db.ForeignKey("stop.id"), primary_key=True)
    timetable_id = db.Column(db.Integer, db.ForeignKey("timetable.id"), primary_key=True)

    def to_json(self):
        return self.stop_id


class Timetable(db.Model):
    __tablename__ = "timetable"
    id = db.Column(db.Integer, primary_key=True)
    hour = db.Column(db.Time, unique=True, nullable=False)

    def to_json(self):
        return {
            'id': self.id,
            'hour': self.hour.strftime('%H:%M:%S')
        }
