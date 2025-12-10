from flask import Flask, jsonify, request, g
from flask_cors import CORS
import sqlite3


app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "http://localhost:5173"}})
DATABASE = 'trainingarc.db'

def get_db():
    db = getattr(g, '_database', None)
    if db is None:
        db = g._database = sqlite3.connect(DATABASE)
    
    def make_dicts(cursor, row):
        return dict((cursor.description[idx][0], value) 
                   for idx, value in enumerate(row))

    db.row_factory = make_dicts
    return db


def query_db(query, args=(), one=False):
    cursor = get_db().execute(query, args)
    rv = cursor.fetchall()
    cursor.close()
    return (rv[0] if rv else None) if one else rv


@app.route('/api/create_new_user', methods=['GET', 'POST'])
def create_new_user():
    username = request.json.get('username')
    password = request.json.get('password')

    existing_user = query_db('SELECT * FROM users WHERE username = ?', [username], one=True)
    if existing_user:
        return jsonify({'success': False, 'message': 'Username already exists'}), 401

    db = get_db()
    db.execute('INSERT INTO users (username, password) VALUES (?, ?)', (username, password))
    db.commit()

    user_id = query_db('SELECT id FROM users WHERE username = ?', [username], one=True)['id']
    return jsonify({'success': True, 'user_id': user_id, 'workout_types': []}), 200


@app.route('/api/login_existing_user', methods=['GET', 'POST'])
def login_existing_user():
    username = request.json.get('username')
    password = request.json.get('password')

    user = query_db('SELECT * FROM users WHERE username = ? AND password = ?', [username, password], one=True)
    if user is None:
        return jsonify({'success': False, 'message': 'Invalid username or password'}), 401
    
    workout_types = query_db('SELECT id, name FROM workout_types WHERE user_id = ?', [user['id']])
    print(workout_types)
    return jsonify({'success': True, 'user_id': user['id'], 'workout_types': workout_types}), 200


@app.route('/api/add_new_workout_type', methods=['GET', 'POST'])
def add_new_workout_type():
    user_id = request.json.get('user_id')
    name = request.json.get('name')
    description = request.json.get('description')

    db = get_db()
    cursor = db.cursor()
    cursor.execute('INSERT INTO workout_types (user_id, name, description) VALUES (?, ?, ?)',
                   (user_id, name, description))
    db.commit()

    new_type_id = cursor.lastrowid
    cursor.close()

    return jsonify({'success': True, 'id': new_type_id, 'name': name, 'description': description}), 201


@app.route('/api/add_new_workout', methods=['GET', 'POST'])
def add_new_workout():
    user_id = request.json.get('user_id')
    workout_type_id = request.json.get('workout_type_id')
    exercises = request.json.get('exercises')
    notes = request.json.get('notes')

    if not user_id or not workout_type_id or not exercises:
        return jsonify({'success': False, 'error': 'Missing required fields'}), 400

    db = get_db()
    cursor = db.cursor()

    cursor.execute("INSERT INTO workouts (user_id, type_id, notes) VALUES (?, ?, ?)" ,(user_id, workout_type_id, notes))
    workout_id = cursor.lastrowid

    for exercise in exercises:
        cursor.execute('''INSERT INTO exercises (workout_id, name, sets, reps, weight, duration_minutes)
                          VALUES (?, ?, ?, ?, ?, ?)''',
                       (workout_id, exercise['name'], exercise['sets'], exercise['reps'],
                        exercise.get('weight'), exercise.get('duration')))
    db.commit()
    cursor.close()

    return jsonify({'success': True, 'workout_id': workout_id}), 201


@app.route('/api/get_user_workouts', methods=['POST'])
def get_user_workouts():
    data = request.get_json()
    user_id = data['user_id']

    query = """
        SELECT 
            w.id AS workout_id,
            w.date,
            w.notes,
            wt.name AS type,
            e.id AS exercise_id,
            e.name AS exercise_name,
            e.sets,
            e.reps,
            e.weight,
            e.duration_minutes
        FROM workouts w
        LEFT JOIN workout_types wt ON w.type_id = wt.id
        LEFT JOIN exercises e ON e.workout_id = w.id
        WHERE w.user_id = ?
        ORDER BY w.date DESC;
    """

    results = query_db(query, [user_id])
    workouts = {}
    for row in results:
        wid = row['workout_id']
        if wid not in workouts:
            workouts[wid] = {
                'id': wid,
                'date': row['date'],
                'notes': row['notes'],
                'type': row['workout_type'],
                'exercises': []
            }
        if row['exercise_id']:
            workouts[wid]['exercises'].append({
                'id': row['exercise_id'],
                'name': row['exercise_name'],
                'sets': row['sets'],
                'reps': row['reps'],
                'weight': row['weight'],
                'duration_minutes': row['duration_minutes']
            })

    print(workouts.values())
    return jsonify({'success': True, 'workouts': list(workouts.values())}), 200


@app.route('/api/get_user_workouts_by_type', methods=['POST'])
def get_user_workouts_by_type():
    data = request.get_json()
    user_id = data['user_id']
    type_id = data['type_id']

    if type_id == "all":
        query = """
            SELECT w.id, w.date, w.notes, wt.name as type
            FROM workouts w
            LEFT JOIN workout_types wt ON w.type_id = wt.id
            WHERE w.user_id = ?
            ORDER BY w.date DESC
        """
        workouts = query_db(query, [user_id])
    else:
        query = """
            SELECT w.id, w.date, w.notes, wt.name as type
            FROM workouts w
            LEFT JOIN workout_types wt ON w.type_id = wt.id
            WHERE w.user_id = ? AND w.type_id = ?
            ORDER BY w.date DESC
        """
        workouts = query_db(query, [user_id, type_id])

    for workout in workouts:
        exercises = query_db('''SELECT id, name, sets, reps, weight, duration_minutes
                                FROM exercises
                                WHERE workout_id = ?''', [workout['id']])
        workout['exercises'] = exercises

    return jsonify({'success': True, 'workouts': workouts}), 200



@app.route('/api/update_exercises', methods=['POST'])
def update_exercises():
    data = request.get_json()
    exercises = data['exercises']

    db = get_db()
    cursor = db.cursor()

    print(exercises)

    for exercise in exercises:
        cursor.execute('''UPDATE exercises
                          SET sets = ?, reps = ?, weight = ?, duration_minutes = ?
                          WHERE id = ?''',
                       (exercise.get('sets'), exercise.get('reps'),
                        exercise.get('weight'), exercise.get('duration'), exercise.get('id')))
    db.commit()
    cursor.close()

    return jsonify({'success': True}), 200


@app.route('/api/delete_exercise', methods=['POST'])
def delete_exercise():
    data = request.get_json()
    exercise_id = data.get('exercise_id')

    if not exercise_id:
        return jsonify({'success': False, 'error': 'Missing exercise_id'}), 400

    db = get_db()
    cursor = db.cursor()
    cursor.execute('DELETE FROM exercises WHERE id = ?', (exercise_id,))
    db.commit()
    cursor.close()

    return jsonify({'success': True}), 200


@app.teardown_appcontext
def close_connection(exception):
    db = getattr(g, '_database', None)
    if db is not None:
        db.close()

if __name__ == '__main__':
    app.run(debug=True, port=4040)