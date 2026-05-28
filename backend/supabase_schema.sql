create table if not exists students (
  id serial primary key,
  full_name text not null,
  student_id text unique not null,
  email text unique not null,
  faculty text not null,
  programme text not null,
  password text not null,
  face_image text not null,
  fingerprint_image text,
  fingerprint_credential_id text,
  fingerprint_challenge text,
  certificate_requested integer default 0,
  request_status text default 'Pending',
  request_date text,
  admin_message text,
  approved_date text,
  collection_date text,
  certificate_collected integer default 0,
  signature text,
  collected_at text,
  created_at text
);

create table if not exists admin_users (
  id serial primary key,
  full_name text,
  email text unique,
  password text,
  role text default 'viewer',
  permissions text,
  created_at text
);

create table if not exists messages (
  id serial primary key,
  student_id text,
  sender text,
  message text,
  is_read integer default 0,
  created_at text
);
