# ============================================================
# IMPORTS
# ============================================================

from flask import Flask, request, jsonify, send_from_directory, Response
from flask_cors import CORS
from werkzeug.security import check_password_hash, generate_password_hash

import cv2
import numpy as np
import base64
import sqlite3
import os
import json
import re
import secrets
import urllib.request
import urllib.error

from datetime import datetime
from urllib.parse import quote

try:
    import psycopg2
    import psycopg2.extras
except ImportError:
    psycopg2 = None

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

# ============================================================
# FLASK APP
# ============================================================

app = Flask(__name__)
CORS_ORIGINS = [
    origin.strip()
    for origin in os.getenv("CORS_ORIGINS", "*").split(",")
    if origin.strip()
]
CORS(app, origins=CORS_ORIGINS or "*")

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# ============================================================
# FACE CASCADE
# ============================================================

cascade_path = os.path.join(
    BASE_DIR,
    "haarcascade_frontalface_default.xml"
)

face_cascade = cv2.CascadeClassifier(cascade_path)

# ============================================================
# FOLDER FOR SAVED FACES
# ============================================================

FACES_FOLDER = os.path.join(
    BASE_DIR,
    "captured_faces"
)

if not os.path.exists(FACES_FOLDER):
    os.makedirs(FACES_FOLDER)

# ============================================================
# DEPLOYMENT SETTINGS
# ============================================================

DATABASE_URL = os.getenv("DATABASE_URL") or os.getenv("SUPABASE_DB_URL")
USE_POSTGRES = bool(DATABASE_URL)

SUPABASE_URL = os.getenv("SUPABASE_URL", "").rstrip("/")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
SUPABASE_STORAGE_BUCKET = os.getenv("SUPABASE_STORAGE_BUCKET", "student-faces")
FACE_MATCH_THRESHOLD = float(os.getenv("FACE_MATCH_THRESHOLD", "0.78"))

DB_INTEGRITY_ERRORS = (sqlite3.IntegrityError,)

if psycopg2:
    DB_INTEGRITY_ERRORS = DB_INTEGRITY_ERRORS + (psycopg2.IntegrityError,)

# ============================================================
# SAFE FILE NAME FUNCTION
# ============================================================

def make_safe_filename(value):

    return (
        value.replace("/", "_")
        .replace("\\", "_")
        .replace(":", "_")
        .replace("*", "_")
        .replace("?", "_")
        .replace('"', "_")
        .replace("<", "_")
        .replace(">", "_")
        .replace("|", "_")
        .replace(" ", "_")
    )

# ============================================================
# DATABASE CONNECTION
# ============================================================

class PostgresCursor:

    def __init__(self, cursor):
        self.cursor = cursor

    def execute(self, query, params=None):
        if params:
            for _ in params:
                query = query.replace("?", "%s", 1)

        return self.cursor.execute(query, params)

    def fetchone(self):
        return self.cursor.fetchone()

    def fetchall(self):
        return self.cursor.fetchall()

class PostgresConnection:

    def __init__(self, conn):
        self.conn = conn

    def cursor(self):
        return PostgresCursor(
            self.conn.cursor(
                cursor_factory=psycopg2.extras.RealDictCursor
            )
        )

    def commit(self):
        return self.conn.commit()

    def rollback(self):
        return self.conn.rollback()

    def close(self):
        return self.conn.close()

def get_db_connection():

    if USE_POSTGRES:

        if not psycopg2:
            raise RuntimeError(
                "DATABASE_URL is set, but psycopg2-binary is not installed"
            )

        connection_options = {}

        if "sslmode=" not in DATABASE_URL:
            connection_options["sslmode"] = os.getenv("DB_SSLMODE", "require")

        return PostgresConnection(
            psycopg2.connect(
                DATABASE_URL,
                **connection_options
            )
        )

    db_path = os.path.join(
        BASE_DIR,
        "database.db"
    )

    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row

    return conn

# ============================================================
# DATABASE SETUP
# ============================================================

def init_db():

    conn = get_db_connection()
    cursor = conn.cursor()

    if USE_POSTGRES:

        cursor.execute("""
        CREATE TABLE IF NOT EXISTS students(
            id SERIAL PRIMARY KEY,
            full_name TEXT NOT NULL,
            student_id TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE NOT NULL,
            faculty TEXT NOT NULL,
            programme TEXT NOT NULL,
            password TEXT NOT NULL,
            face_image TEXT NOT NULL,
            fingerprint_image TEXT,
            fingerprint_credential_id TEXT,
            fingerprint_challenge TEXT,
            certificate_requested INTEGER DEFAULT 0,
            request_status TEXT DEFAULT 'Pending',
            request_date TEXT,
            admin_message TEXT,
            approved_date TEXT,
            collection_date TEXT,
            certificate_collected INTEGER DEFAULT 0,
            signature TEXT,
            collected_at TEXT,
            created_at TEXT
        )
        """)

        cursor.execute("""
        CREATE TABLE IF NOT EXISTS admin_users(
            id SERIAL PRIMARY KEY,
            full_name TEXT,
            email TEXT UNIQUE,
            password TEXT,
            role TEXT DEFAULT 'viewer',
            permissions TEXT,
            created_at TEXT
        )
        """)

        cursor.execute("""
        CREATE TABLE IF NOT EXISTS messages(
            id SERIAL PRIMARY KEY,
            student_id TEXT,
            sender TEXT,
            message TEXT,
            is_read INTEGER DEFAULT 0,
            created_at TEXT
        )
        """)

    else:

        cursor.execute("""
        CREATE TABLE IF NOT EXISTS students(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            full_name TEXT NOT NULL,
            student_id TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE NOT NULL,
            faculty TEXT NOT NULL,
            programme TEXT NOT NULL,
            password TEXT NOT NULL,
            face_image TEXT NOT NULL,
            fingerprint_image TEXT,
            fingerprint_credential_id TEXT,
            fingerprint_challenge TEXT,
            certificate_requested INTEGER DEFAULT 0,
            request_status TEXT DEFAULT 'Pending',
            request_date TEXT,
            admin_message TEXT,
            approved_date TEXT,
            collection_date TEXT,
            certificate_collected INTEGER DEFAULT 0,
            signature TEXT,
            collected_at TEXT,
            created_at TEXT
        )
        """)

        cursor.execute("""
        CREATE TABLE IF NOT EXISTS admin_users(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            full_name TEXT,
            email TEXT UNIQUE,
            password TEXT,
            role TEXT DEFAULT 'viewer',
            permissions TEXT,
            created_at TEXT
        )
        """)

        cursor.execute("""
        CREATE TABLE IF NOT EXISTS messages(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            student_id TEXT,
            sender TEXT,
            message TEXT,
            is_read INTEGER DEFAULT 0,
            created_at TEXT
        )
        """)

    conn.commit()
    conn.close()

# ============================================================
# UPDATE OLD DATABASE SAFELY
# ============================================================

def update_db():

    conn = get_db_connection()
    cursor = conn.cursor()

    student_columns = [
        ("certificate_requested", "INTEGER DEFAULT 0"),
        ("request_status", "TEXT DEFAULT 'Pending'"),
        ("request_date", "TEXT"),
        ("admin_message", "TEXT"),
        ("approved_date", "TEXT"),
        ("collection_date", "TEXT"),
        ("certificate_collected", "INTEGER DEFAULT 0"),
        ("signature", "TEXT"),
        ("collected_at", "TEXT"),
        ("fingerprint_image", "TEXT"),
        ("fingerprint_credential_id", "TEXT"),
        ("fingerprint_challenge", "TEXT")
    ]

    for col_name, col_type in student_columns:

        try:
            cursor.execute(
                f"ALTER TABLE students ADD COLUMN {col_name} {col_type}"
            )
            conn.commit()
        except:
            conn.rollback()

    message_columns = [
        ("student_id", "TEXT"),
        ("sender", "TEXT"),
        ("message", "TEXT"),
        ("is_read", "INTEGER DEFAULT 0"),
        ("created_at", "TEXT")
    ]

    for col_name, col_type in message_columns:

        try:
            cursor.execute(
                f"ALTER TABLE messages ADD COLUMN {col_name} {col_type}"
            )
            conn.commit()
        except:
            conn.rollback()

    admin_columns = [
        ("full_name", "TEXT"),
        ("email", "TEXT"),
        ("password", "TEXT"),
        ("role", "TEXT DEFAULT 'viewer'"),
        ("permissions", "TEXT"),
        ("created_at", "TEXT")
    ]

    for col_name, col_type in admin_columns:

        try:
            cursor.execute(
                f"ALTER TABLE admin_users ADD COLUMN {col_name} {col_type}"
            )
            conn.commit()
        except:
            conn.rollback()

    cursor.execute("""
    SELECT COUNT(*) AS super_admin_count
    FROM admin_users
    WHERE role = 'super_admin'
    """)

    super_admin_count = cursor.fetchone()["super_admin_count"]

    if super_admin_count == 0:

        cursor.execute("""
        UPDATE admin_users
        SET role = 'super_admin'
        WHERE id = (
            SELECT id
            FROM admin_users
            WHERE email IS NOT NULL
            AND email != ''
            ORDER BY id ASC
            LIMIT 1
        )
        """)

    conn.commit()
    conn.close()

def initialize_database():

    try:

        init_db()
        update_db()

    except Exception as e:

        print(
            f"Database initialization skipped: {e}",
            flush=True
        )

initialize_database()

# ============================================================
# HOME ROUTE
# ============================================================

@app.route("/", methods=["GET"])
def home():

    return jsonify({
        "success": True,
        "message": "Backend running successfully"
    })

# ============================================================
# GET STUDENT IMAGE
# ============================================================

@app.route("/student-image/<filename>", methods=["GET"])
def get_student_image(filename):

    if supabase_storage_enabled():

        image_bytes = download_supabase_object(filename)

        if image_bytes is None:

            return jsonify({
                "success": False,
                "message": "Image not found"
            }), 404

        return Response(
            image_bytes,
            mimetype="image/png"
        )

    return send_from_directory(
        FACES_FOLDER,
        filename
    )

# ============================================================
# FACE DETECTION
# ============================================================

def detect_face_from_base64(image_data):

    try:

        img = decode_base64_image(image_data)

        gray = cv2.cvtColor(
            img,
            cv2.COLOR_BGR2GRAY
        )

        faces = face_cascade.detectMultiScale(
            gray,
            scaleFactor=1.3,
            minNeighbors=5,
            minSize=(30, 30)
        )

        return len(faces) > 0

    except:
        return False

# ============================================================
# BIOMETRIC IMAGE HELPERS
# ============================================================

def decode_base64_image(image_data):

    if not image_data:
        return None

    encoded_data = image_data.split(",", 1)[1] if "," in image_data else image_data
    decoded_bytes = base64.b64decode(encoded_data)

    np_arr = np.frombuffer(
        decoded_bytes,
        np.uint8
    )

    return cv2.imdecode(
        np_arr,
        cv2.IMREAD_COLOR
    )

def image_blur_score(image):

    gray = cv2.cvtColor(
        image,
        cv2.COLOR_BGR2GRAY
    )

    return cv2.Laplacian(
        gray,
        cv2.CV_64F
    ).var()

def frame_difference_score(first_image, second_image):

    first_gray = cv2.cvtColor(
        first_image,
        cv2.COLOR_BGR2GRAY
    )

    second_gray = cv2.cvtColor(
        second_image,
        cv2.COLOR_BGR2GRAY
    )

    second_gray = cv2.resize(
        second_gray,
        (
            first_gray.shape[1],
            first_gray.shape[0]
        )
    )

    difference = cv2.absdiff(
        first_gray,
        second_gray
    )

    return float(np.mean(difference))

def crop_largest_face(image):

    gray = cv2.cvtColor(
        image,
        cv2.COLOR_BGR2GRAY
    )

    faces = face_cascade.detectMultiScale(
        gray,
        scaleFactor=1.3,
        minNeighbors=5,
        minSize=(30, 30)
    )

    if len(faces) == 0:
        return None

    x, y, w, h = max(
        faces,
        key=lambda face: face[2] * face[3]
    )

    return image[
        y:y + h,
        x:x + w
    ]

def extract_face_encoding(image):

    face = crop_largest_face(
        image
    )

    if face is None:
        return None

    gray = cv2.cvtColor(
        face,
        cv2.COLOR_BGR2GRAY
    )

    resized = cv2.resize(
        gray,
        (96, 96)
    )

    normalized = cv2.equalizeHist(
        resized
    ).astype("float32")

    normalized = normalized / 255.0
    normalized = normalized.flatten()

    norm = np.linalg.norm(
        normalized
    )

    if norm == 0:
        return None

    return normalized / norm

def compare_face_encodings(first_encoding, second_encoding):

    similarity = float(
        np.dot(
            first_encoding,
            second_encoding
        )
    )

    return similarity >= FACE_MATCH_THRESHOLD

def validate_biometric_liveness(images):

    if len(images) < 3:

        return {
            "success": False,
            "message": "Biometric verification needs at least 3 live camera frames"
        }

    decoded_images = []
    encodings = []

    for image_data in images:

        image = decode_base64_image(image_data)

        if image is None:

            return {
                "success": False,
                "message": "Invalid biometric image received"
            }

        if image_blur_score(image) < 35:

            return {
                "success": False,
                "message": "Biometric image is not clear. Please face the camera and try again."
            }

        encoding = extract_face_encoding(image)

        if encoding is None:

            return {
                "success": False,
                "message": "No face detected during biometric verification"
            }

        decoded_images.append(image)
        encodings.append(encoding)

    reference_encoding = encodings[0]

    for encoding in encodings[1:]:

        same_person = compare_face_encodings(
            reference_encoding,
            encoding
        )

        if not same_person:

            return {
                "success": False,
                "message": "Biometric frames do not belong to the same person"
            }

    movement_scores = [
        frame_difference_score(decoded_images[0], image)
        for image in decoded_images[1:]
    ]

    if max(movement_scores) < 2.0:

        return {
            "success": False,
            "message": "Biometric liveness failed. Please use the live camera, not a static photo."
        }

    return {
        "success": True,
        "image": decoded_images[0],
        "encoding": reference_encoding
    }

def save_base64_image(image_data, folder, filename):

    encoded_data = image_data.split(",", 1)[1] if "," in image_data else image_data
    decoded_bytes = base64.b64decode(encoded_data)

    if supabase_storage_enabled():

        upload_supabase_object(
            filename,
            decoded_bytes,
            "image/png"
        )

        return filename

    image_path = os.path.join(
        folder,
        filename
    )

    with open(image_path, "wb") as f:
        f.write(decoded_bytes)

    return image_path

def supabase_storage_enabled():

    return bool(
        SUPABASE_URL
        and SUPABASE_SERVICE_ROLE_KEY
        and SUPABASE_STORAGE_BUCKET
    )

def supabase_storage_url(filename):

    safe_path = quote(
        filename,
        safe="/"
    )

    return (
        f"{SUPABASE_URL}/storage/v1/object/"
        f"{SUPABASE_STORAGE_BUCKET}/{safe_path}"
    )

def supabase_headers(content_type=None):

    headers = {
        "apikey": SUPABASE_SERVICE_ROLE_KEY,
        "Authorization": f"Bearer {SUPABASE_SERVICE_ROLE_KEY}"
    }

    if content_type:
        headers["Content-Type"] = content_type

    return headers

def upload_supabase_object(filename, content, content_type):

    request_data = urllib.request.Request(
        supabase_storage_url(filename),
        data=content,
        method="POST",
        headers={
            **supabase_headers(content_type),
            "x-upsert": "true"
        }
    )

    try:

        with urllib.request.urlopen(request_data, timeout=30) as response:
            response.read()

    except urllib.error.HTTPError as error:

        if error.code == 409:

            update_request = urllib.request.Request(
                supabase_storage_url(filename),
                data=content,
                method="PUT",
                headers=supabase_headers(content_type)
            )

            with urllib.request.urlopen(update_request, timeout=30) as response:
                response.read()

            return

        raise

def download_supabase_object(filename):

    request_data = urllib.request.Request(
        supabase_storage_url(filename),
        method="GET",
        headers=supabase_headers()
    )

    try:

        with urllib.request.urlopen(request_data, timeout=30) as response:
            return response.read()

    except urllib.error.HTTPError as error:

        if error.code == 404:
            return None

        raise

def load_stored_face_image(filename):

    if supabase_storage_enabled():

        image_bytes = download_supabase_object(filename)

        if image_bytes is None:
            return None

        np_arr = np.frombuffer(
            image_bytes,
            np.uint8
        )

        return cv2.imdecode(
            np_arr,
            cv2.IMREAD_COLOR
        )

    image_path = os.path.join(
        FACES_FOLDER,
        filename
    )

    if not os.path.exists(image_path):
        return None

    return cv2.imread(
        image_path
    )

# ============================================================
# DEVICE BIOMETRIC HELPERS
# ============================================================

def create_challenge():

    return secrets.token_urlsafe(32)

def hash_password(password):

    return generate_password_hash(password)

def verify_password(stored_password, password):

    try:

        return (
            check_password_hash(stored_password, password)
            or stored_password == password
        )

    except:

        return stored_password == password

def validate_password_strength(password):

    return (
        len(password) >= 8
        and re.search(r"[A-Z]", password)
        and re.search(r"[^A-Za-z0-9]", password)
    )

# ============================================================
# TEST CAMERA
# ============================================================

@app.route("/test-camera", methods=["POST"])
def test_camera():

    try:

        data = request.json
        image_data = data["image"]

        if detect_face_from_base64(image_data):

            return jsonify({
                "success": True,
                "message": "Face detected"
            })

        return jsonify({
            "success": False,
            "message": "Face not clear. Retake photo."
        })

    except Exception as e:

        return jsonify({
            "success": False,
            "message": str(e)
        })

# ============================================================
# SIGNUP
# ============================================================

@app.route("/signup", methods=["POST"])
@app.route("/register-student", methods=["POST"])
def signup():

    try:

        data = request.json

        full_name = data["full_name"]
        student_id = data["student_id"].strip().upper()
        email = data["email"]
        faculty = data["faculty"]
        programme = data["programme"]
        password = data["password"]
        image_data = data["image"]
        fingerprint_credential_id = data.get("fingerprint_credential_id")

        if not all([
            full_name,
            student_id,
            email,
            faculty,
            programme,
            password,
            image_data,
            fingerprint_credential_id
        ]):

            return jsonify({
                "success": False,
                "message": "All fields, face image, and device passkey setup are required"
            })

        if "@" not in email:

            return jsonify({
                "success": False,
                "message": "Invalid email"
            })

        if student_id != data["student_id"].strip():

            return jsonify({
                "success": False,
                "message": "Student ID must use uppercase letters"
            })

        if not validate_password_strength(password):

            return jsonify({
                "success": False,
                "message": "Password must be at least 8 characters with an uppercase letter and a special character"
            })

        if not detect_face_from_base64(image_data):

            return jsonify({
                "success": False,
                "message": "Face not detected"
            })

        safe_student_id = make_safe_filename(student_id)

        image_filename = f"{safe_student_id}.png"

        save_base64_image(
            image_data,
            FACES_FOLDER,
            image_filename
        )

        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute("""
        INSERT INTO students(
            full_name,
            student_id,
            email,
            faculty,
            programme,
            password,
            face_image,
            fingerprint_credential_id,
            created_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            full_name,
            student_id,
            email,
            faculty,
            programme,
            hash_password(password),
            image_filename,
            fingerprint_credential_id,
            datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        ))

        conn.commit()
        conn.close()

        return jsonify({
            "success": True,
            "message": "Signup successful"
        })

    except DB_INTEGRITY_ERRORS:

        return jsonify({
            "success": False,
            "message": "Student ID or Email already exists"
        })

    except Exception as e:

        return jsonify({
            "success": False,
            "message": str(e)
        })

# ============================================================
# LOGIN
# ============================================================

@app.route("/login", methods=["POST"])
def login():

    try:

        data = request.json

        email = data["email"]
        password = data["password"]

        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute("""
        SELECT *
        FROM students
        WHERE email = ?
        """, (email,))

        user = cursor.fetchone()
        conn.close()

        if user and verify_password(user["password"], password):

            return jsonify({
                "success": True,
                "message": "Login successful",
                "student": {
                    "full_name": user["full_name"],
                    "student_id": user["student_id"],
                    "email": user["email"],
                    "faculty": user["faculty"],
                    "programme": user["programme"],
                    "request_status": user["request_status"],
                    "admin_message": user["admin_message"],
                    "face_image": user["face_image"]
                }
            })

        return jsonify({
            "success": False,
            "message": "Invalid credentials"
        })

    except Exception as e:

        return jsonify({
            "success": False,
            "message": str(e)
        })

# ============================================================
# VERIFY FACE
# ============================================================

@app.route("/verify", methods=["POST"])
def verify():

    try:

        data = request.json
        image_data = data.get("image")
        biometric_images = data.get("images", [])

        if biometric_images:

            biometric_result = validate_biometric_liveness(
                biometric_images
            )

            if not biometric_result["success"]:

                return jsonify(biometric_result)

            captured_encoding = biometric_result["encoding"]

        elif image_data:

            captured_image = decode_base64_image(image_data)

            if captured_image is None:

                return jsonify({
                    "success": False,
                    "message": "Invalid image received"
                })

            captured_encoding = extract_face_encoding(
                captured_image
            )

            if captured_encoding is None:

                return jsonify({
                    "success": False,
                    "message": "No face detected"
                })

        else:

            return jsonify({
                "success": False,
                "message": "No image received"
            })

        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute("""
        SELECT *
        FROM students
        """)

        students = cursor.fetchall()
        conn.close()

        for student in students:

            stored_image = load_stored_face_image(
                student["face_image"]
            )

            if stored_image is None:
                continue

            stored_encoding = extract_face_encoding(
                stored_image
            )

            if stored_encoding is None:
                continue

            match = compare_face_encodings(
                stored_encoding,
                captured_encoding
            )

            if match:

                return jsonify({
                    "success": True,
                    "biometric_verified": bool(biometric_images),
                    "student": {
                        "full_name": student["full_name"],
                        "student_id": student["student_id"],
                        "email": student["email"],
                        "faculty": student["faculty"],
                        "programme": student["programme"],
                        "request_status": student["request_status"],
                        "admin_message": student["admin_message"],
                        "face_image": student["face_image"],
                        "fingerprint_credential_id": student["fingerprint_credential_id"]
                    }
                })

        return jsonify({
            "success": False,
            "message": "No matching student found"
        })

    except Exception as e:

        return jsonify({
            "success": False,
            "message": str(e)
        })

# ============================================================
# DEVICE FINGERPRINT / WEBAUTHN
# ============================================================

@app.route("/biometric/challenge", methods=["POST"])
def biometric_challenge():

    try:

        data = request.json
        student_id = data.get("student_id")

        if not student_id:

            return jsonify({
                "success": False,
                "message": "Student ID is required"
            })

        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute("""
        SELECT *
        FROM students
        WHERE TRIM(LOWER(student_id)) = TRIM(LOWER(?))
        """, (student_id,))

        student = cursor.fetchone()

        if not student:

            conn.close()

            return jsonify({
                "success": False,
                "message": "Student not found"
            })

        credential_id = student["fingerprint_credential_id"]

        if not credential_id:

            conn.close()

            return jsonify({
                "success": False,
                "message": "This student has not registered a device passkey"
            })

        challenge = create_challenge()

        cursor.execute("""
        UPDATE students
        SET fingerprint_challenge = ?
        WHERE student_id = ?
        """, (
            challenge,
            student["student_id"]
        ))

        conn.commit()
        conn.close()

        return jsonify({
            "success": True,
            "challenge": challenge,
            "credential_id": credential_id
        })

    except Exception as e:

        return jsonify({
            "success": False,
            "message": str(e)
        })

@app.route("/biometric/verify", methods=["POST"])
def biometric_verify():

    try:

        data = request.json
        student_id = data.get("student_id")
        credential_id = data.get("credential_id")
        challenge = data.get("challenge")

        if not student_id or not credential_id or not challenge:

            return jsonify({
                "success": False,
                "message": "Student ID, credential, and challenge are required"
            })

        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute("""
        SELECT *
        FROM students
        WHERE TRIM(LOWER(student_id)) = TRIM(LOWER(?))
        """, (student_id,))

        student = cursor.fetchone()

        if not student:

            conn.close()

            return jsonify({
                "success": False,
                "message": "Student not found"
            })

        stored_credential_id = student["fingerprint_credential_id"]
        stored_challenge = student["fingerprint_challenge"]

        if credential_id != stored_credential_id:

            conn.close()

            return jsonify({
                "success": False,
                "message": "Device fingerprint credential does not match this student"
            })

        if challenge != stored_challenge:

            conn.close()

            return jsonify({
                "success": False,
                "message": "Device fingerprint challenge is invalid or expired"
            })

        cursor.execute("""
        UPDATE students
        SET fingerprint_challenge = NULL
        WHERE student_id = ?
        """, (student["student_id"],))

        conn.commit()
        conn.close()

        return jsonify({
            "success": True,
            "message": "Device fingerprint verified"
        })

    except Exception as e:

        return jsonify({
            "success": False,
            "message": str(e)
        })

# ============================================================
# REQUEST CERTIFICATE
# ============================================================

@app.route("/request-certificate", methods=["POST"])
def request_certificate():

    try:

        data = request.json
        student_id = data["student_id"]

        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute("""
        SELECT *
        FROM students
        WHERE student_id = ?
        """, (student_id,))

        student = cursor.fetchone()

        if not student:

            conn.close()

            return jsonify({
                "success": False,
                "message": "Student not found"
            })

        if (
            student["certificate_requested"] == 1
            and student["request_status"] == "Pending"
        ):

            conn.close()

            return jsonify({
                "success": False,
                "message": "You already have a pending certificate request"
            })

        cursor.execute("""
        UPDATE students
        SET
            certificate_requested = 1,
            request_status = 'Pending',
            request_date = ?,
            admin_message = NULL,
            approved_date = NULL,
            collection_date = NULL,
            certificate_collected = 0,
            signature = NULL,
            collected_at = NULL
        WHERE student_id = ?
        """, (
            datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            student_id
        ))

        cursor.execute("""
        INSERT INTO messages(
            student_id,
            sender,
            message,
            is_read,
            created_at
        )
        VALUES (?, ?, ?, ?, ?)
        """, (
            student_id,
            "System",
            "Your certificate request has been submitted successfully. You will receive a clearance message or approval schedule from the admin.",
            0,
            datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        ))

        conn.commit()
        conn.close()

        return jsonify({
            "success": True,
            "message": "Certificate request submitted"
        })

    except Exception as e:

        return jsonify({
            "success": False,
            "message": str(e)
        })

# ============================================================
# STUDENT PROFILE
# ============================================================

@app.route("/student-profile/<path:student_id>", methods=["GET"])
def student_profile(student_id):

    try:

        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute("""
        SELECT *
        FROM students
        WHERE TRIM(LOWER(student_id)) = TRIM(LOWER(?))
        """, (student_id,))

        student = cursor.fetchone()
        conn.close()

        if not student:

            return jsonify({
                "success": False,
                "message": "Student not found"
            })

        return jsonify({
            "success": True,
            "student": {
                "full_name": student["full_name"],
                "student_id": student["student_id"],
                "email": student["email"],
                "faculty": student["faculty"],
                "programme": student["programme"],
                "face_image": student["face_image"],
                "request_status": student["request_status"],
                "admin_message": student["admin_message"],
                "certificate_requested": student["certificate_requested"],
                "certificate_collected": student["certificate_collected"],
                "approved_date": student["approved_date"],
                "collection_date": student["collection_date"],
                "collected_at": student["collected_at"],
                "signature": student["signature"],
                "request_date": student["request_date"]
            }
        })

    except Exception as e:

        return jsonify({
            "success": False,
            "message": str(e)
        })

# ============================================================
# GET STUDENT MESSAGES
# ============================================================

@app.route("/student/messages/<path:student_id>", methods=["GET"])
def get_student_messages(student_id):

    try:

        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute("""
        SELECT *
        FROM messages
        WHERE TRIM(LOWER(student_id)) = TRIM(LOWER(?))
        ORDER BY id DESC
        """, (student_id,))

        messages = cursor.fetchall()

        message_list = []

        for msg in messages:

            message_list.append({
                "id": msg["id"],
                "sender": msg["sender"],
                "message": msg["message"],
                "is_read": msg["is_read"],
                "created_at": msg["created_at"]
            })

        if not message_list:

            cursor.execute("""
            SELECT *
            FROM students
            WHERE TRIM(LOWER(student_id)) = TRIM(LOWER(?))
            """, (student_id,))

            student = cursor.fetchone()

            if student and student["admin_message"]:

                message_list.append({
                    "id": 0,
                    "sender": "Admin",
                    "message": student["admin_message"],
                    "is_read": 1,
                    "created_at": (
                        student["approved_date"]
                        or student["request_date"]
                        or ""
                    )
                })

        conn.close()

        return jsonify({
            "success": True,
            "messages": message_list
        })

    except Exception as e:

        return jsonify({
            "success": False,
            "message": str(e)
        })

# ============================================================
# MARK MESSAGE AS READ
# ============================================================

@app.route("/student/read-message/<int:id>", methods=["PUT"])
def mark_message_as_read(id):

    try:

        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute("""
        UPDATE messages
        SET is_read = 1
        WHERE id = ?
        """, (id,))

        conn.commit()
        conn.close()

        return jsonify({
            "success": True,
            "message": "Message marked as read"
        })

    except Exception as e:

        return jsonify({
            "success": False,
            "message": str(e)
        })

# ============================================================
# ADMIN - GET REGISTERED STUDENTS
# ============================================================

@app.route("/admin/students", methods=["GET"])
def get_students():

    try:

        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute("""
        SELECT *
        FROM students
        ORDER BY id DESC
        """)

        students = cursor.fetchall()
        conn.close()

        student_list = []

        for student in students:

            student_list.append({
                "id": student["id"],
                "full_name": student["full_name"],
                "student_id": student["student_id"],
                "email": student["email"],
                "faculty": student["faculty"],
                "programme": student["programme"],
                "face_image": student["face_image"],
                "request_status": student["request_status"],
                "certificate_requested": student["certificate_requested"],
                "certificate_collected": student["certificate_collected"],
                "request_date": student["request_date"],
                "approved_date": student["approved_date"],
                "collection_date": student["collection_date"],
                "collected_at": student["collected_at"],
                "signature": student["signature"],
                "admin_message": student["admin_message"]
            })

        return jsonify({
            "success": True,
            "students": student_list
        })

    except Exception as e:

        return jsonify({
            "success": False,
            "message": str(e)
        })

# ============================================================
# ADMIN - CERTIFICATE REQUESTS
# ============================================================

@app.route("/admin/certificate-requests", methods=["GET"])
def certificate_requests():

    try:

        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute("""
        SELECT *
        FROM students
        WHERE certificate_requested = 1
        AND request_status = 'Pending'
        ORDER BY request_date DESC
        """)

        requests = cursor.fetchall()
        conn.close()

        request_list = []

        for student in requests:

            request_list.append({
                "id": student["id"],
                "full_name": student["full_name"],
                "student_id": student["student_id"],
                "email": student["email"],
                "faculty": student["faculty"],
                "programme": student["programme"],
                "face_image": student["face_image"],
                "request_status": student["request_status"],
                "request_date": student["request_date"],
                "approved_date": student["approved_date"],
                "collection_date": student["collection_date"],
                "admin_message": student["admin_message"]
            })

        return jsonify({
            "success": True,
            "requests": request_list
        })

    except Exception as e:

        return jsonify({
            "success": False,
            "message": str(e)
        })

# ============================================================
# ADMIN - UNAPPROVED STUDENTS
# ============================================================

@app.route("/admin/unapproved-students", methods=["GET"])
def unapproved_students():

    try:

        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute("""
        SELECT *
        FROM students
        WHERE request_status = 'Rejected'
        ORDER BY request_date DESC
        """)

        students = cursor.fetchall()
        conn.close()

        unapproved_list = []

        for student in students:

            unapproved_list.append({
                "id": student["id"],
                "full_name": student["full_name"],
                "student_id": student["student_id"],
                "email": student["email"],
                "faculty": student["faculty"],
                "programme": student["programme"],
                "face_image": student["face_image"],
                "request_date": student["request_date"],
                "approved_date": student["approved_date"],
                "collection_date": student["collection_date"],
                "admin_message": student["admin_message"]
            })

        return jsonify({
            "success": True,
            "students": unapproved_list
        })

    except Exception as e:

        return jsonify({
            "success": False,
            "message": str(e)
        })

# ============================================================
# ADMIN - APPROVE REQUEST
# ============================================================

@app.route("/admin/approve-request", methods=["POST"])
def approve_request():

    try:

        data = request.json

        student_id = data.get("student_id")
        admin_message = data.get("admin_message")
        collection_date = data.get("collection_date") or data.get("approved_date")

        if not student_id:

            return jsonify({
                "success": False,
                "message": "Student ID is required"
            })

        if not admin_message:

            admin_message = "Your certificate request has been approved."

        if collection_date:

            final_message = (
                f"{admin_message} "
                f"Your collection date is {collection_date}."
            )

        else:

            final_message = admin_message

        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute("""
        SELECT *
        FROM students
        WHERE TRIM(LOWER(student_id)) = TRIM(LOWER(?))
        """, (student_id,))

        student = cursor.fetchone()

        if not student:

            conn.close()

            return jsonify({
                "success": False,
                "message": "Student not found"
            })

        student_id = student["student_id"]

        cursor.execute("""
        UPDATE students
        SET
            request_status = 'Approved',
            admin_message = ?,
            approved_date = ?,
            collection_date = ?,
            certificate_collected = 0,
            signature = NULL,
            collected_at = NULL
        WHERE student_id = ?
        """, (
            final_message,
            datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            collection_date,
            student_id
        ))

        cursor.execute("""
        INSERT INTO messages(
            student_id,
            sender,
            message,
            is_read,
            created_at
        )
        VALUES (?, ?, ?, ?, ?)
        """, (
            student_id,
            "Admin",
            final_message,
            0,
            datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        ))

        conn.commit()
        conn.close()

        return jsonify({
            "success": True,
            "message": "Student approved and message sent"
        })

    except Exception as e:

        return jsonify({
            "success": False,
            "message": str(e)
        })

# ============================================================
# ADMIN - REJECT REQUEST
# ============================================================

@app.route("/admin/reject-request", methods=["POST"])
def reject_request():

    try:

        data = request.json

        student_id = data.get("student_id")
        admin_message = data.get("admin_message")

        if not student_id:

            return jsonify({
                "success": False,
                "message": "Student ID is required"
            })

        if not admin_message:

            admin_message = "Your certificate request was rejected. Please clear all pending issues and try again."

        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute("""
        SELECT *
        FROM students
        WHERE TRIM(LOWER(student_id)) = TRIM(LOWER(?))
        """, (student_id,))

        student = cursor.fetchone()

        if not student:

            conn.close()

            return jsonify({
                "success": False,
                "message": "Student not found"
            })

        student_id = student["student_id"]

        cursor.execute("""
        UPDATE students
        SET
            request_status = 'Rejected',
            admin_message = ?
        WHERE student_id = ?
        """, (
            admin_message,
            student_id
        ))

        cursor.execute("""
        INSERT INTO messages(
            student_id,
            sender,
            message,
            is_read,
            created_at
        )
        VALUES (?, ?, ?, ?, ?)
        """, (
            student_id,
            "Admin",
            admin_message,
            0,
            datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        ))

        conn.commit()
        conn.close()

        return jsonify({
            "success": True,
            "message": "Student rejected and message sent"
        })

    except Exception as e:

        return jsonify({
            "success": False,
            "message": str(e)
        })

# ============================================================
# ADMIN - APPROVED STUDENTS
# ============================================================

@app.route("/admin/approved-students", methods=["GET"])
def approved_students():

    try:

        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute("""
        SELECT *
        FROM students
        WHERE request_status = 'Approved'
        ORDER BY approved_date DESC
        """)

        students = cursor.fetchall()
        conn.close()

        approved_list = []

        for student in students:

            approved_list.append({
                "id": student["id"],
                "full_name": student["full_name"],
                "student_id": student["student_id"],
                "email": student["email"],
                "faculty": student["faculty"],
                "programme": student["programme"],
                "face_image": student["face_image"],
                "approved_date": student["approved_date"],
                "collection_date": student["collection_date"],
                "certificate_collected": student["certificate_collected"],
                "collected_at": student["collected_at"],
                "signature": student["signature"],
                "admin_message": student["admin_message"]
            })

        return jsonify({
            "success": True,
            "students": approved_list
        })

    except Exception as e:

        return jsonify({
            "success": False,
            "message": str(e)
        })

# ============================================================
# ADMIN - MARK CERTIFICATE COLLECTED
# ============================================================

@app.route("/admin/mark-collected", methods=["POST"])
def mark_certificate_collected():

    try:

        data = request.json

        student_id = data.get("student_id")
        signature = data.get("signature", "")

        if not student_id:

            return jsonify({
                "success": False,
                "message": "Student ID is required"
            })

        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute("""
        SELECT *
        FROM students
        WHERE TRIM(LOWER(student_id)) = TRIM(LOWER(?))
        """, (student_id,))

        student = cursor.fetchone()

        if not student:

            conn.close()

            return jsonify({
                "success": False,
                "message": "Student not found"
            })

        if student["request_status"] != "Approved":

            conn.close()

            return jsonify({
                "success": False,
                "message": "Only approved students can be marked as collected"
            })

        collected_at = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        student_id = student["student_id"]

        cursor.execute("""
        UPDATE students
        SET
            certificate_collected = 1,
            signature = ?,
            collected_at = ?
        WHERE student_id = ?
        """, (
            signature,
            collected_at,
            student_id
        ))

        cursor.execute("""
        INSERT INTO messages(
            student_id,
            sender,
            message,
            is_read,
            created_at
        )
        VALUES (?, ?, ?, ?, ?)
        """, (
            student_id,
            "Admin",
            "Your certificate has been marked as collected.",
            0,
            collected_at
        ))

        conn.commit()
        conn.close()

        return jsonify({
            "success": True,
            "message": "Certificate marked as collected",
            "collected_at": collected_at
        })

    except Exception as e:

        return jsonify({
            "success": False,
            "message": str(e)
        })

# ============================================================
# ADMIN USERS
# ============================================================

ADMIN_PERMISSIONS = [
    "view_students",
    "manage_requests",
    "manage_approved",
    "manage_users"
]

def permissions_from_role(role):

    if role == "super_admin":

        return ADMIN_PERMISSIONS

    if role == "user_manager":

        return [
            "view_students",
            "manage_users"
        ]

    if role == "request_manager":

        return [
            "view_students",
            "manage_requests",
            "manage_approved"
        ]

    return ["view_students"]

def admin_permissions(admin):

    try:

        if admin["permissions"]:

            permissions = json.loads(admin["permissions"])

            return [
                permission
                for permission in permissions
                if permission in ADMIN_PERMISSIONS
            ]

    except:

        pass

    if admin["role"]:

        return permissions_from_role(admin["role"])

    if admin["email"]:

        return ADMIN_PERMISSIONS

    return ["view_students"]

@app.route("/admin/login", methods=["POST"])
def admin_login():

    try:

        data = request.json

        email = data.get("email")
        password = data.get("password")

        if not email or not password:

            return jsonify({
                "success": False,
                "message": "Email and password are required"
            })

        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute("""
        SELECT *
        FROM admin_users
        WHERE LOWER(email) = LOWER(?)
        """, (email,))

        admin = cursor.fetchone()
        conn.close()

        if admin and verify_password(admin["password"], password):

            return jsonify({
                "success": True,
                "message": "Admin login successful",
                "admin": {
                    "id": admin["id"],
                    "full_name": admin["full_name"],
                    "email": admin["email"],
                    "permissions": admin_permissions(admin)
                }
            })

        return jsonify({
            "success": False,
            "message": "Invalid admin credentials"
        })

    except Exception as e:

        return jsonify({
            "success": False,
            "message": str(e)
        })

@app.route("/admin/users", methods=["GET"])
def get_admin_users():

    try:

        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute("""
        SELECT *
        FROM admin_users
        ORDER BY id DESC
        """)

        users = cursor.fetchall()
        conn.close()

        user_list = []

        for user in users:

            user_list.append({
                "id": user["id"],
                "full_name": user["full_name"],
                "email": user["email"],
                "permissions": admin_permissions(user),
                "created_at": user["created_at"]
            })

        return jsonify({
            "success": True,
            "users": user_list
        })

    except Exception as e:

        return jsonify({
            "success": False,
            "message": str(e)
        })

# ============================================================
# CREATE ADMIN USER
# ============================================================

@app.route("/admin/create-user", methods=["POST"])
def create_admin_user():

    try:

        data = request.json

        full_name = data["full_name"]
        email = data["email"]
        password = data["password"]
        permissions = data.get("permissions", ["view_students"])

        if not full_name or not email or not password:

            return jsonify({
                "success": False,
                "message": "All fields are required"
            })

        if not validate_password_strength(password):

            return jsonify({
                "success": False,
                "message": "Password must be at least 8 characters with an uppercase letter and a special character"
            })

        permissions = [
            permission
            for permission in permissions
            if permission in ADMIN_PERMISSIONS
        ]

        if "view_students" not in permissions:

            permissions.insert(0, "view_students")

        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute("""
        SELECT COUNT(*) AS admin_count
        FROM admin_users
        WHERE email IS NOT NULL
        AND email != ''
        """)

        admin_count = cursor.fetchone()["admin_count"]

        if admin_count == 0:

            permissions = ADMIN_PERMISSIONS

        cursor.execute("""
        INSERT INTO admin_users(
            full_name,
            email,
            password,
            role,
            permissions,
            created_at
        )
        VALUES (?, ?, ?, ?, ?, ?)
        """, (
            full_name,
            email,
            hash_password(password),
            "custom",
            json.dumps(permissions),
            datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        ))

        conn.commit()
        conn.close()

        return jsonify({
            "success": True,
            "message": "Admin user created"
        })

    except DB_INTEGRITY_ERRORS:

        return jsonify({
            "success": False,
            "message": "Admin email already exists"
        })

    except Exception as e:

        return jsonify({
            "success": False,
            "message": str(e)
        })

# ============================================================
# DELETE ADMIN USER
# ============================================================

@app.route("/admin/delete-user/<int:id>", methods=["DELETE"])
def delete_admin_user(id):

    try:

        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute("""
        DELETE FROM admin_users
        WHERE id = ?
        """, (id,))

        conn.commit()
        conn.close()

        return jsonify({
            "success": True,
            "message": "Admin deleted"
        })

    except Exception as e:

        return jsonify({
            "success": False,
            "message": str(e)
        })

# ============================================================
# RUN SERVER
# ============================================================

if __name__ == "__main__":

    app.run(
        debug=True,
        host="0.0.0.0",
        port=5000
    )
