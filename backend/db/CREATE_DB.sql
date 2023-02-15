------CREATE TABLES-----
CREATE TABLE bus(
    id SERIAL NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE stop(
    id SERIAL NOT NULL,
    name VARCHAR(255) NOT NULL,
    description VARCHAR(255) NOT NULL,
    image VARCHAR(255) NOT NULL,
    latitude FLOAT NOT NULL,
    longitude FLOAT NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE timetable(
    id serial NOT NULL,
    hour time NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE bus_stop(
    stop_id SERIAL NOT NULL,
    bus_id SERIAL NOT NULL,
    PRIMARY KEY (stop_id, bus_id),
    CONSTRAINT bus_stop_fk FOREIGN KEY (bus_id) REFERENCES bus(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT stop_bus_fk FOREIGN KEY (stop_id) REFERENCES stop(id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE stop_timetable(
    stop_id SERIAL NOT NULL,
    timetable_id serial NOT NULL,
    PRIMARY KEY (stop_id, timetable_id),
    CONSTRAINT stop_timetable_fk FOREIGN KEY (stop_id) REFERENCES stop(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT timetable_stop_fk FOREIGN KEY (timetable_id) REFERENCES timetable(id) ON DELETE CASCADE ON UPDATE CASCADE
);