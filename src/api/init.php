<?php
/**
 * Database initialization script
 * 
 * This script creates the necessary tables for the Cooop website
 */

// Include database configuration
require_once __DIR__ . '/../config/database.php';

// Get database connection
$conn = getDbConnection();

// Create experiences table
$experiencesTable = "
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
";

// Create opportunities table
$opportunitiesTable = "
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
    upload_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
";

// Create admins table
$adminsTable = "
CREATE TABLE IF NOT EXISTS admins (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    type ENUM('regular', 'root') NOT NULL DEFAULT 'regular',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
";

// Execute the queries
if ($conn->query($experiencesTable) === TRUE) {
    echo "Experiences table created successfully\n";
} else {
    echo "Error creating experiences table: " . $conn->error . "\n";
}

if ($conn->query($opportunitiesTable) === TRUE) {
    echo "Opportunities table created successfully\n";
} else {
    echo "Error creating opportunities table: " . $conn->error . "\n";
}

if ($conn->query($adminsTable) === TRUE) {
    echo "Admins table created successfully\n";
} else {
    echo "Error creating admins table: " . $conn->error . "\n";
}

// Create initial root admin user (password: admin123)
$username = 'root_admin';
$password = password_hash('admin123', PASSWORD_DEFAULT);
$type = 'root';

$checkAdmin = "SELECT * FROM admins WHERE username = '$username'";
$result = $conn->query($checkAdmin);

if ($result->num_rows == 0) {
    $insertAdmin = "INSERT INTO admins (username, password, type) VALUES ('$username', '$password', '$type')";
    if ($conn->query($insertAdmin) === TRUE) {
        echo "Root admin created successfully\n";
    } else {
        echo "Error creating root admin: " . $conn->error . "\n";
    }
} else {
    echo "Root admin already exists\n";
}

// Close connection
$conn->close();

echo "Database initialization complete\n";
