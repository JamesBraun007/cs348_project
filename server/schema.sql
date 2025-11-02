-- Table: users
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL
);

-- Table: workout_types
CREATE TABLE workout_types (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,                     
    name TEXT NOT NULL,                  -- e.g. "Back/bi", "Chest/tri"
    description TEXT,
    UNIQUE(user_id, name),               --same user can’t have duplicate names
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Table: workouts
CREATE TABLE workouts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    type_id INTEGER,
    date DATETIME DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (type_id) REFERENCES workout_types(id)
);

-- Table: exercises
CREATE TABLE exercises (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    workout_id INTEGER NOT NULL,
    name TEXT NOT NULL,                 -- e.g., "Bench Press", "Squat", "Running"
    sets INTEGER,
    reps INTEGER,
    weight REAL,                        -- weight in kg or lbs (null for cardio)
    duration_minutes REAL,              -- for cardio or timed workouts
    FOREIGN KEY (workout_id) REFERENCES workouts(id) ON DELETE CASCADE
);