from . import db


class Timetable(db.Model):
    __tablename__ = "timetable"
    id = db.Column(db.Integer, primary_key=True)
    hour = db.Column(db.Time, unique=False, nullable=False)

    def to_json(self):
        return {
            'id': self.id,
            'hour': self.hour.strftime('%H:%M:%S')
        }
