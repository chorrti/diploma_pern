CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE
);

CREATE TABLE thematics (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE
);

CREATE TABLE degrees (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE
);

CREATE TABLE registration_requests (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    familia TEXT NOT NULL,
    otchestvo TEXT NOT NULL,
    email TEXT NOT NULL,
    role_id INT REFERENCES roles(id),
    birth_date DATE,
    phone TEXT,
    city TEXT,
    organization TEXT
);

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    login TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE profiles (
    id SERIAL PRIMARY KEY,
    user_id INT UNIQUE REFERENCES users(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    familia TEXT NOT NULL,
    otchestvo TEXT NOT NULL,
    role_id INT REFERENCES roles(id),
    birth_date DATE,
    city TEXT,
    organization TEXT,
    phone TEXT,
    email TEXT,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE competitions (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    regulation_file_path TEXT,
    start_date DATE,
    end_date DATE,
    results_date DATE,
    thematic_id INT REFERENCES thematics(id),
    status TEXT DEFAULT 'open',
    created_by INT REFERENCES profiles(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT check_status CHECK (status IN ('open', 'closed', 'archived')),
    CONSTRAINT check_dates CHECK (start_date <= end_date)
);

CREATE TABLE competition_applications (
    id SERIAL PRIMARY KEY,
    student_id INT REFERENCES profiles(id),
    teacher_id INT REFERENCES profiles(id),
    title TEXT NOT NULL,
    description TEXT,
    agreed_for_exhib BOOLEAN NOT NULL,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    competition_id INT REFERENCES competitions(id)
);

CREATE TABLE application_attachments (
    id SERIAL PRIMARY KEY,
    application_id INT REFERENCES competition_applications(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('file', 'link')),
    content TEXT NOT NULL
);

CREATE TABLE exhibition (
    id SERIAL PRIMARY KEY,
    student_id INT REFERENCES profiles(id),
    city TEXT,
    file_path TEXT,
    competition_id INT REFERENCES competitions(id)
);

CREATE TABLE results (
    id SERIAL PRIMARY KEY,
    competition_id INT REFERENCES competitions(id),
    student_id INT REFERENCES profiles(id),
    teacher_id INT REFERENCES profiles(id),
    thematic_id INT REFERENCES thematics(id),
    diploma_path TEXT,            -- путь к PDF-документу диплома
    degree_id INT REFERENCES degrees(id)
);

CREATE TABLE teacher_student (
    id SERIAL PRIMARY KEY,
    teacher_id INT REFERENCES profiles(id),
    student_id INT REFERENCES profiles(id)
);

INSERT INTO roles (name) VALUES
('Ученик'),
('Учитель'),
('Модератор'),
('Админ');