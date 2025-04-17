<?php
/**
 * Authentication API Implementation
 * 
 * This file implements the authentication system for the Cooop website
 */

// Include required files
require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../includes/utils.php';

// Session configuration
session_start();

/**
 * Check if user is authenticated
 * 
 * @return bool True if user is authenticated, false otherwise
 */
function isAuthenticated() {
    return isset($_SESSION['user_id']) && isset($_SESSION['username']) && isset($_SESSION['user_type']);
}

/**
 * Check if user is admin
 * 
 * @return bool True if user is admin, false otherwise
 */
function isAdmin() {
    return isAuthenticated() && in_array($_SESSION['user_type'], ['regular', 'root']);
}

/**
 * Check if user is root admin
 * 
 * @return bool True if user is root admin, false otherwise
 */
function isRootAdmin() {
    return isAuthenticated() && $_SESSION['user_type'] === 'root';
}

/**
 * Get current user username
 * 
 * @return string|null Username if authenticated, null otherwise
 */
function getCurrentUser() {
    return isAuthenticated() ? $_SESSION['username'] : null;
}

/**
 * Get current user type
 * 
 * @return string|null User type if authenticated, null otherwise
 */
function getCurrentUserType() {
    return isAuthenticated() ? $_SESSION['user_type'] : null;
}

/**
 * Handle authentication API requests
 * 
 * @param string $method HTTP method (GET, POST, PUT, DELETE)
 * @param array $segments URL path segments
 * @param array $input Request body data
 * @return array Response data
 */
function handleAuthRequest($method, $segments, $input) {
    $response = ['status' => 'error', 'message' => 'Invalid request'];
    
    try {
        // Login
        if (isset($segments[1]) && $segments[1] === 'login' && $method === 'POST') {
            $data = sanitizeInput($input);
            $response = login($data);
        }
        // Logout
        else if (isset($segments[1]) && $segments[1] === 'logout' && $method === 'POST') {
            $response = logout();
        }
        // Check authentication status
        else if (isset($segments[1]) && $segments[1] === 'status' && $method === 'GET') {
            $response = getAuthStatus();
        }
    } catch (Exception $e) {
        logError($e->getMessage(), __FILE__, __LINE__);
        $response = ['status' => 'error', 'message' => 'An error occurred while processing your request'];
    }
    
    return $response;
}

/**
 * Login user
 * 
 * @param array $data Login data (username, password)
 * @return array Response data
 */
function login($data) {
    // Validate required fields
    $requiredFields = ['username', 'password'];
    
    $validation = validateRequiredFields($data, $requiredFields);
    if ($validation !== true) {
        return $validation;
    }
    
    $conn = getDbConnection();
    
    // Check if user exists
    $query = "SELECT * FROM admins WHERE username = ?";
    $stmt = $conn->prepare($query);
    $stmt->bind_param("s", $data['username']);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        $conn->close();
        return ['status' => 'error', 'message' => 'Invalid username or password'];
    }
    
    $user = $result->fetch_assoc();
    
    // Verify password
    if (!password_verify($data['password'], $user['password'])) {
        $conn->close();
        return ['status' => 'error', 'message' => 'Invalid username or password'];
    }
    
    // Set session variables
    $_SESSION['user_id'] = $user['id'];
    $_SESSION['username'] = $user['username'];
    $_SESSION['user_type'] = $user['type'];
    
    $conn->close();
    
    return [
        'status' => 'success',
        'message' => 'Login successful',
        'data' => [
            'username' => $user['username'],
            'type' => $user['type']
        ]
    ];
}

/**
 * Logout user
 * 
 * @return array Response data
 */
function logout() {
    // Destroy session
    session_unset();
    session_destroy();
    
    return [
        'status' => 'success',
        'message' => 'Logout successful'
    ];
}

/**
 * Get authentication status
 * 
 * @return array Response data
 */
function getAuthStatus() {
    if (isAuthenticated()) {
        return [
            'status' => 'success',
            'data' => [
                'authenticated' => true,
                'username' => $_SESSION['username'],
                'type' => $_SESSION['user_type']
            ]
        ];
    } else {
        return [
            'status' => 'success',
            'data' => [
                'authenticated' => false
            ]
        ];
    }
}
