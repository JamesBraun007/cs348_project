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

@app.route('/api/users', methods=['GET'])
def get_users():
    


@app.teardown_appcontext
def close_connection(exception):
    db = getattr(g, '_database', None)
    if db is not None:
        db.close()


if __name__ == '__main__':
    app.run(debug=True, port=4040)