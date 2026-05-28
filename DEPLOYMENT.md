# Phone + Supabase + Vercel Setup

## 1. Create Supabase resources

1. Create a Supabase project.
2. Open SQL Editor and run `backend/supabase_schema.sql`.
3. Open Storage and create a bucket named `student-faces`.
4. Keep the bucket private. The Flask API reads/writes images with the service role key.

## 2. Deploy the Flask backend

The backend uses OpenCV and `face-recognition`, so deploy it to a Python host that supports native Linux packages such as Render, Railway, Fly.io, or a VPS. Vercel is best used for the React frontend here.

Use these backend settings:

```txt
Root directory: backend
Build command: pip install -r requirements.txt
Start command: gunicorn app:app --bind 0.0.0.0:$PORT
```

Set these environment variables on the backend host:

```txt
DATABASE_URL=your Supabase Postgres connection string
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your Supabase service role key
SUPABASE_STORAGE_BUCKET=student-faces
CORS_ORIGINS=https://your-vercel-domain.vercel.app
DB_SSLMODE=require
```

## 3. Deploy the React app to Vercel

Use these Vercel settings:

```txt
Root directory: face-cert
Build command: npm run build
Output directory: dist
```

Set this environment variable in Vercel:

```txt
VITE_API_BASE_URL=https://your-backend-domain
```

After changing `VITE_API_BASE_URL`, redeploy the Vercel project.

## 4. Local development

For local React + Flask:

```txt
backend/.env can use the same Supabase variables, or omit them to use SQLite/local files.
face-cert/.env should contain VITE_API_BASE_URL=http://localhost:5000
```

Run Flask on port `5000`, then run Vite from `face-cert`.
