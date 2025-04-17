<?php
/**
 * Database Configuration File
 * 
 * This file contains the database connection settings for the Cooop website.
 */

// Database credentials
define('DB_HOST', 'localhost');
define('DB_USER', 'root');
define('DB_PASS', '12345678');
define('DB_NAME', 'cooop_db');

/**
 * Database Connection
 * 
 * Creates a new mysqli connection using the defined credentials.
 * 
 * @return mysqli The database connection
 */
function getDbConnection() {
    $conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
    
    // Check connection
    if ($conn->connect_error) {
        die("Connection failed: " . $conn->connect_error);
    }
    
    // Set charset to utf8mb4 to support Arabic characters
    $conn->set_charset("utf8mb4");
    
    return $conn;
}
