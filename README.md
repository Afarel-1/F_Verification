# Pentvars Certificate Verification System

Pentvars Certificate Verification System is a web application for managing certificate requests with student account registration, face capture, device biometric verification, administrator approval, messaging, and certificate collection tracking.

The project is split into two applications:

- `backend/`: Flask API, database logic, face verification, admin endpoints, Supabase storage support, and CLI maintenance commands.
- `face-cert/`: React + Vite frontend for students and administrators.

## What The System Does

- Students create accounts with personal academic details.
- Students register a face image and device biometric credential.
- Students request certificate collection through the application.
- The system verifies identity using face matching and device biometric confirmation.
- Administrators review pending requests, approve or reject them, send messages, and mark certificates as collected.
- Admin users can be managed with different permissions.
- Public FAQ, Privacy, and Legal pages explain system use and data handling.

## Why This Project Matters

Certificate collection can be vulnerable to impersonation, manual delays, poor tracking, and weak communication between students and administrators. This system improves the process by introducing identity verification, structured approval, digital messaging, and clear collection records.

Face verification helps confirm the person involved matches the registered student. Device biometric verification adds another layer by using the security already built into the student's phone or computer, such as fingerprint, face unlock, PIN, or Windows Hello.

## Technology Stack

- Frontend: React, Vite, React Router
- Backend: Python, Flask, Flask-CORS
- Database: SQLite for local development, Supabase Postgres for deployment
- Storage: Local file storage in development, Supabase Storage for deployed face images
- Authentication helpers: Werkzeug password hashing
- Face processing: OpenCV and face-recognition related backend logic
- Deployment: Vercel for frontend, Render or another Python host for backend

## Project Structure

```text
.
├── backend/
│   ├── app.py
│   ├── requirements.txt
│   ├── supabase_schema.sql
│   ├── captured_faces/
│   └── captured_fingerprints/
├── face-cert/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── pages/
│   │   └── styles/
│   ├── package.json
│   └── index.html
├── DEPLOYMENT.md
└── README.md
```

## Local Setup

### Backend

```powershell
cd backend
pip install -r requirements.txt
python app.py
```

The backend runs on:

```text
http://localhost:5000
```

If `DATABASE_URL` is not set, the backend uses local SQLite. If `DATABASE_URL` is set, it connects to Supabase Postgres.

### Frontend

```powershell
cd face-cert
npm install
npm run dev
```

The frontend runs on:

```text
http://localhost:5173
```

## Environment Variables

Backend `.env` example:

```env
DATABASE_URL=postgresql://postgres.project-ref:encoded-password@aws-1-eu-west-2.pooler.supabase.com:6543/postgres
SUPABASE_URL=https://project-ref.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_STORAGE_BUCKET=student-faces
CORS_ORIGINS=http://localhost:5173,https://your-frontend-domain.vercel.app
DB_SSLMODE=require
FACE_MATCH_THRESHOLD=0.78
```

Important: encode special characters in the database password when it is inside `DATABASE_URL`. For example, `@` becomes `%40`.

Frontend `.env` example:

```env
VITE_API_BASE_URL=http://localhost:5000
```

## Supabase Setup

1. Create a Supabase project.
2. Run `backend/supabase_schema.sql` in the SQL editor.
3. Create a private storage bucket named `student-faces`.
4. Add the Supabase URL, service role key, storage bucket, and database URL to the backend host environment variables.
5. Use the correct Supabase database connection string:
   - Pooler host on port `6543` uses username `postgres.project-ref`.
   - Direct database host on port `5432` uses username `postgres`.

## Deployment

Frontend deployment can be done on Vercel:

```text
Root directory: face-cert
Build command: npm run build
Output directory: dist
```

Backend deployment can be done on Render:

```text
Root directory: backend
Build command: pip install -r requirements.txt
Start command: gunicorn app:app --bind 0.0.0.0:$PORT
```

After changing environment variables on Render or Vercel, redeploy the service.

## Admin Management From Terminal

Create or update a super admin:

```powershell
cd backend
flask --app app.py seed-admin --name "Admin Name" --email "admin@example.com" --password "StrongPass@2026" --role super_admin
```

Available roles:

```text
super_admin
user_manager
request_manager
viewer
```

Delete student test data and messages:

```powershell
cd backend
flask --app app.py reset-test-data
```

Delete student test data, messages, and admin users:

```powershell
flask --app app.py reset-test-data --include-admins
```

## Main Pages

- Splash Screen: Shows the official system logo before routing users to authentication.
- Auth Page: Allows students to sign up, register face/device biometric data, and log in.
- Home Page: Student dashboard for certificate workflow actions.
- Request Certificate Page: Starts the certificate request and verification process.
- Verify Page: Handles face verification.
- Messages Page: Displays administrator updates.
- Profile Page: Shows student profile and certificate status.
- Admin Login: Allows authorized staff to access the admin dashboard.
- Admin Dashboard: Allows staff to approve, reject, message, manage requests, mark collection, and manage admin users.
- FAQ, Privacy, Legal: Public information pages explaining system use, data handling, and responsibilities.

## Current Limitations

- Face verification quality depends on lighting, camera quality, and the registered image.
- Admin authentication is application-level and should be strengthened further for production.
- Audit logs can be expanded to record more detailed admin actions.
- The system depends on correct Supabase and deployment environment variables.
- Institution-specific privacy and legal language should be reviewed by the institution before production use.

## Future Improvements

- Add stronger role-based access enforcement on every sensitive admin endpoint.
- Add audit trails for approvals, rejections, login attempts, and collection actions.
- Add email or SMS notifications for request updates.
- Add QR code verification for printed certificate collection receipts.
- Add reporting dashboards for request volume, approvals, rejections, and collection history.
- Add backup and restore documentation.
- Add automated tests for API endpoints and frontend workflows.
- Add liveness detection to reduce spoofing attempts with printed photos or screens.
- Integrate with official student information systems.
- Add a production consent screen for biometric-related verification.

## Pulling Or Contributing

1. Clone the repository.
2. Create a branch for your change.
3. Install backend and frontend dependencies.
4. Create local `.env` files using the examples above.
5. Run the frontend and backend locally.
6. Make small, focused commits.
7. Test the changed workflow before opening a pull request.

Recommended checks:

```powershell
cd backend
python -m py_compile app.py
```

```powershell
cd face-cert
npm run build
```

## Presentation Downloads

When the frontend is running or deployed, the presentation files are available at:

```text
/downloads/certificate-verification-presentation.pptx
/downloads/lecturer-questions-and-student-answers.docx
```

## Security Notes

- Never commit `.env` files with real secrets.
- Keep Supabase service role keys only on the backend.
- Use HTTPS in production.
- Use strong database and admin passwords.
- Remove test student data before production use.
- Restrict admin access to authorized staff only.
