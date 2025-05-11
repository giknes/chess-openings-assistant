from flask import Flask, jsonify
import sqlite3

app = Flask(__name__)

def get_db_connection():
    conn = sqlite3.connect('data/openings.db')
    conn.row_factory = sqlite3.Row
    return conn

@app.route('/api/openings')
def get_openings():
    conn = get_db_connection()
    openings = conn.execute('SELECT id, name FROM openings').fetchall()
    conn.close()
    return jsonify([dict(o) for o in openings])

@app.route('/api/opening/<int:opening_id>')
def get_opening(opening_id):
    conn = get_db_connection()
    opening = conn.execute('SELECT * FROM openings WHERE id = ?', (opening_id,)).fetchone()
    conn.close()
    if opening:
        return jsonify(dict(opening))
    return jsonify({'error': 'Opening not found'}), 404

if __name__ == '__main__':
    app.run(debug=True)
