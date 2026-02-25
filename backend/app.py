from flask import Flask, request, jsonify
from flask_cors import CORS
import cv2
import numpy as np
import base64
import sqlite3
import os
import face_recognition
from datetime import datetime

app = Flask(__name__)
CORS(app)

# ===============================
# FACE CASCADE LOAD (LOCAL FILE)
# ===============================
cascade_path = os.path.join(os.getcwd(), "haarcascade_frontalface_default.xml")
face_cascade = cv2.CascadeClassifier(cascade_path)

# ===============================
# FOLDER FOR SAVED FACES
# ===============================
FACES_FOLDER = "captured_faces"
if not os.path.exists(FACES_FOLDER):
    os.makedirs(FACES_FOLDER)

# ===============================
# DATABASE SETUP
# ===============================
def init_db():
    conn = sqlite3.connect("database.db")
    cursor = conn.cursor()

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS students(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        full_name TEXT,
        student_id TEXT UNIQUE,
        programme TEXT,
        duration TEXT,
        face_image TEXT,
        created_at TEXT
    )
    """)

    conn.commit()
    conn.close()

init_db()

# ===============================
# HOME TEST ROUTE
# ===============================
@app.route("/", methods=["GET"])
def home():
    return jsonify({"message": "Face Verification API is running"})

# ===============================
# FACE DETECTION FUNCTION
# ===============================
def detect_face_from_base64(image_data):
    encoded_data = image_data.split(",")[1]
    decoded_bytes = base64.b64decode(encoded_data)

    np_arr = np.frombuffer(decoded_bytes, np.uint8)
    img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

    faces = face_cascade.detectMultiScale(
        gray,
        scaleFactor=1.3,
        minNeighbors=5,
        minSize=(30, 30)
    )

    return len(faces) > 0

# ===================================================
# ⭐ CAMERA TEST ROUTE (THIS WAS MISSING)
# ===================================================
@app.route("/test-camera", methods=["POST"])
def test_camera():
    try:
        data = request.json
        image_data = data["image"]

        face_found = detect_face_from_base64(image_data)

        if face_found:
            return jsonify({
                "success": True,
                "message": "Face detected"
            })
        else:
            return jsonify({
                "success": False,
                "message": "No face detected"
            })

    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        })

# ===================================================
# ⭐ FINAL REGISTRATION ROUTE
# ===================================================
@app.route("/register-student", methods=["POST"])
def register_student():
    try:
        data = request.json

        full_name = data["full_name"]
        student_id = data["student_id"]
        programme = data["programme"]
        duration = data["duration"]
        image_data = data["image"]

        # verify face again before saving
        if not detect_face_from_base64(image_data):
            return jsonify({"success": False, "message": "No face detected"})

        # save image
        encoded_data = image_data.split(",")[1]
        decoded_bytes = base64.b64decode(encoded_data)

        image_filename = f"{student_id}.png"
        image_path = os.path.join(FACES_FOLDER, image_filename)

        with open(image_path, "wb") as f:
            f.write(decoded_bytes)

        # save to DB
        conn = sqlite3.connect("database.db")
        cursor = conn.cursor()

        cursor.execute("""
        INSERT INTO students (full_name, student_id, programme, duration, face_image, created_at)
        VALUES (?, ?, ?, ?, ?, ?)
        """, (
            full_name,
            student_id,
            programme,
            duration,
            image_filename,
            datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        ))

        conn.commit()
        conn.close()

        return jsonify({
            "success": True,
            "message": "Student registered successfully 🎉"
        })

    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        })

# =========================
# FACE VERIFICATION ROUTE
# =========================

@app.route("/verify", methods=["POST"])
def verify():
    try:
        data = request.json
        image_data = data.get("image")

        if not image_data:
            return jsonify({"success": False, "message": "No image received"})

        # Decode base64 image
        image_data = image_data.split(",")[1]
        image_bytes = base64.b64decode(image_data)
        np_arr = np.frombuffer(image_bytes, np.uint8)
        captured_image = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

        # Encode captured face
        captured_encodings = face_recognition.face_encodings(captured_image)

        if len(captured_encodings) == 0:
            return jsonify({"success": False, "message": "No face detected"})

        captured_encoding = captured_encodings[0]

        # Connect to DB
        conn = sqlite3.connect("database.db")
        cursor = conn.cursor()
        cursor.execute("SELECT full_name, student_id, programme, duration, face_image FROM students")
        students = cursor.fetchall()
        conn.close()

        # Loop through all students
        for student in students:
            full_name, student_id, programme, duration, face_image = student

            image_path = os.path.join("captured_faces", face_image)

            if not os.path.exists(image_path):
                continue

            stored_image = face_recognition.load_image_file(image_path)
            stored_encodings = face_recognition.face_encodings(stored_image)

            if len(stored_encodings) == 0:
                continue

            stored_encoding = stored_encodings[0]

            match = face_recognition.compare_faces([stored_encoding], captured_encoding)

            if match[0]:
                return jsonify({
                    "success": True,
                    "student": {
                        "full_name": full_name,
                        "student_id": student_id,
                        "programme": programme,
                        "duration": duration
                    }
                })

        return jsonify({"success": False, "message": "No match found"})

    except Exception as e:
        return jsonify({"success": False, "message": str(e)})
    

# ===============================
# RUN SERVER
# ===============================
if __name__ == "__main__":
    app.run(debug=True)
