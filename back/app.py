from flask import Flask, jsonify
import sqlite3
import os

app = Flask(__name__)

DB_PATH = os.path.join('data', 'openings.db')

@app.route('/api/openings', methods=['GET'])
def get_openings():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('SELECT id, name, description FROM openings')
    openings = [{'id': row[0], 'name': row[1]} for row in cursor.fetchall()]
    conn.close()
    return jsonify(openings)

@app.route('/api/opening/<int:opening_id>', methods=['GET'])
def get_opening(opening_id):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM openings WHERE id = ?', (opening_id,))
    row = cursor.fetchone()
    conn.close()
    if row:
        opening = {
            'id': row[0],
            'name': row[1],
            'description': row[2],
            'fen': row[3]
        }
        return jsonify(opening)
    return jsonify({'error': 'Opening not found'}), 404

if __name__ == '__main__':
    if not os.path.exists(DB_PATH):
        print(f'Data Base not found: {DB_PATH}')
    else:
        app.run(debug=True)
