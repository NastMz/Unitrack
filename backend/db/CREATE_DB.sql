------CREATE TABLES-----
CREATE TABLE "user"(
    id SERIAL NOT NULL,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    username VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    PRIMARY KEY (id),
    UNIQUE (username)
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
    PRIMARY KEY (id),
    UNIQUE (hour)
);

CREATE TABLE stop_timetable(
    stop_id SERIAL NOT NULL,
    timetable_id serial NOT NULL,
    PRIMARY KEY (stop_id, timetable_id),
    CONSTRAINT stop_timetable_fk FOREIGN KEY (stop_id) REFERENCES stop(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT timetable_stop_fk FOREIGN KEY (timetable_id) REFERENCES timetable(id) ON DELETE CASCADE ON UPDATE CASCADE
);