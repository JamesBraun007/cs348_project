from flask import Flask, jsonify
from flask_cors import CORS

import sqlite3
from flask import g

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
    
@app.route('/api/signup', methods=['GET', 'POST'])


@app.teardown_appcontext
def close_connection(exception):
    db = getattr(g, '_database', None)
    if db is not None:
        db.close()


if __name__ == '__main__':
    app.run(debug=True, port=4040)