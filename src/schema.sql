-- Cooop Database Schema

-- Create database
CREATE DATABASE IF NOT EXISTS cooop_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE cooop_db;

-- Create admins table
CREATE TABLE IF NOT EXISTS admins (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    type ENUM('regular', 'root') NOT NULL DEFAULT 'regular',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Create experiences table
CREATE TABLE IF NOT EXISTS experiences (
    id INT AUTO_INCREMENT PRIMARY KEY,
    university_name VARCHAR(100) NOT NULL,
    college VARCHAR(100) NOT NULL,
    major VARCHAR(100) NOT NULL,
    grade_scale DECIMAL(10,2) NOT NULL,
    grade DECIMAL(10,2) NOT NULL,
    true_grade_scaler DECIMAL(10,4) NOT NULL,
    company_name VARCHAR(100) NOT NULL,
    how_to_apply VARCHAR(255) NOT NULL,
    salary DECIMAL(10,2) DEFAULT 0,
    duration INT NOT NULL COMMENT 'Duration in weeks',
    tasks TEXT NOT NULL,
    positives TEXT,
    negatives TEXT,
    recommended BOOLEAN DEFAULT FALSE,
    why_recommend TEXT,
    additional_info TEXT,
    contracted BOOLEAN DEFAULT FALSE,
    uploader_ip VARCHAR(45) NOT NULL,
    status ENUM('visible', 'hidden') NOT NULL DEFAULT 'visible',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Create opportunities table
CREATE TABLE IF NOT EXISTS opportunities (
    id INT AUTO_INCREMENT PRIMARY KEY,
    company_name VARCHAR(100) NOT NULL,
    major_needed VARCHAR(100) NOT NULL,
    job_description TEXT NOT NULL,
    salary DECIMAL(10,2) DEFAULT 0,
    duration VARCHAR(50),
    status ENUM('open', 'closed') NOT NULL DEFAULT 'open',
    url VARCHAR(255),
    admin_username VARCHAR(50) NOT NULL,
    upload_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (admin_username) REFERENCES admins(username) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Create initial root admin user (password: admin123)
INSERT INTO admins (username, password, type) VALUES 
('root_admin', '$2y$10$8KGQFGDEQRDCXvKqhqMOyeRlVP7vgRWNLNmy9W0q0tCvLPtGYlQXe', 'root');
