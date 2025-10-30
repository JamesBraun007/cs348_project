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

@app.route('/api/login', methods=['GET', 'POST'])
def get_existing_user():
    username = request.json.get('username')
    password = request.json.get('password')

    user = query_db('SELECT * FROM users WHERE username = ? AND password = ?', [username, password], one=True)
    if user is None:
        return jsonify({'success': False, 'message': 'Invalid username or password'}), 401
    
    workouts = query_db('SELECT * FROM workouts WHERE user_id = ? ORDER BY date DESC', [user['id']])
    return jsonify({'success': True, 'workouts': workouts}), 200
    
@app.route('/api/signup', methods=['GET', 'POST'])
def create_new_user():
    username = request.json.get('username')
    password = request.json.get('password')

    existing_user = query_db('SELECT * FROM users WHERE username = ?', [username], one=True)
    if existing_user:
        return jsonify({'success': False, 'message': 'Username already exists'}), 401

    db = get_db()
    db.execute('INSERT INTO users (username, password) VALUES (?, ?)', (username, password))
    db.commit()

    return jsonify({'success': True, 'message': 'User created successfully'}), 200

@app.teardown_appcontext
def close_connection(exception):
    db = getattr(g, '_database', None)
    if db is not None:
        db.close()

if __name__ == '__main__':
    app.run(debug=True, port=4040)