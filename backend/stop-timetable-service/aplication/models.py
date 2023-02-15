from . import db


class StopTimetable(db.Model):
    __tablename__ = "stop_timetable"
    stop_id = db.Column(db.Integer, db.ForeignKey("stop.id"), primary_key=True)
    timetable_id = db.Column(db.Integer, db.ForeignKey("timetable.id"), primary_key=True)

    def to_json(self):
        return self.stop_id
