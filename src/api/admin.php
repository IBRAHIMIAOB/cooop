<?php
/**
 * Admin API Implementation
 * 
 * This file implements the API endpoints for admin functionality
 */

// Include required files
require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../includes/utils.php';
require_once __DIR__ . '/../auth/auth.php';

/**
 * Handle admin API requests
 * 
 * @param string $method HTTP method (GET, POST, PUT, DELETE)
 * @param array $segments URL path segments
 * @param array $input Request body data
 * @return array Response data
 */
function handleAdminRequest($method, $segments, $input) {
    $conn = getDbConnection();
    $response = ['status' => 'error', 'message' => 'Invalid request'];
    
    try {
        // Check if user is admin
        if (!isAdmin()) {
            return ['status' => 'error', 'message' => 'Unauthorized'];
        }
        
        // List all admins (root admin only)
        if (isset($segments[1]) && $segments[1] === 'list' && $method === 'GET') {
            $response = listAdmins($conn);
        }
        // Add new admin (root admin only)
        else if (isset($segments[1]) && $segments[1] === 'add' && $method === 'POST') {
            $data = sanitizeInput($input);
            $response = addAdmin($conn, $data);
        }
        // Delete admin (root admin only)
        else if (isset($segments[1]) && $segments[1] === 'delete' && isset($segments[2]) && $method === 'DELETE') {
            $username = $segments[2];
            $response = deleteAdmin($conn, $username);
        }
        // Change password
        else if (isset($segments[1]) && $segments[1] === 'change-password' && $method === 'POST') {
            $data = sanitizeInput($input);
            $response = changePassword($conn, $data);
        }
    } catch (Exception $e) {
        logError($e->getMessage(), __FILE__, __LINE__);
        $response = ['status' => 'error', 'message' => 'An error occurred while processing your request'];
    }
    
    $conn->close();
    return $response;
}

/**
 * List all admins (root admin only)
 * 
 * @param mysqli $conn Database connection
 * @return array Response data
 */
function listAdmins($conn) {
    // Check if user is root admin
    if (!isRootAdmin()) {
        return ['status' => 'error', 'message' => 'Unauthorized'];
    }
    
    // Get all admins
    $query = "SELECT id, username, type, created_at FROM admins ORDER BY created_at DESC";
    $result = $conn->query($query);
    
    $admins = [];
    while ($row = $result->fetch_assoc()) {
        $admins[] = $row;
    }
    
    return [
        'status' => 'success',
        'data' => $admins
    ];
}

/**
 * Add new admin (root admin only)
 * 
 * @param mysqli $conn Database connection
 * @param array $data Admin data (username, password, type)
 * @return array Response data
 */
function addAdmin($conn, $data) {
    // Check if user is root admin
    if (!isRootAdmin()) {
        return ['status' => 'error', 'message' => 'Unauthorized'];
    }
    
    // Validate required fields
    $requiredFields = ['username', 'password', 'type'];
    
    $validation = validateRequiredFields($data, $requiredFields);
    if ($validation !== true) {
        return $validation;
    }
    
    // Validate admin type
    if (!in_array($data['type'], ['regular', 'root'])) {
        return ['status' => 'error', 'message' => 'Invalid admin type'];
    }
    
    // Check if username already exists
    $query = "SELECT * FROM admins WHERE username = ?";
    $stmt = $conn->prepare($query);
    $stmt->bind_param("s", $data['username']);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows > 0) {
        return ['status' => 'error', 'message' => 'Username already exists'];
    }
    
    // Hash password
    $hashedPassword = password_hash($data['password'], PASSWORD_DEFAULT);
    
    // Insert new admin
    $query = "INSERT INTO admins (username, password, type) VALUES (?, ?, ?)";
    $stmt = $conn->prepare($query);
    $stmt->bind_param("sss", $data['username'], $hashedPassword, $data['type']);
    
    if ($stmt->execute()) {
        return [
            'status' => 'success',
            'message' => 'Admin added successfully'
        ];
    } else {
        logError($conn->error, __FILE__, __LINE__);
        return [
            'status' => 'error',
            'message' => 'Failed to add admin'
        ];
    }
}

/**
 * Delete admin (root admin only)
 * 
 * @param mysqli $conn Database connection
 * @param string $username Username of admin to delete
 * @return array Response data
 */
function deleteAdmin($conn, $username) {
    // Check if user is root admin
    if (!isRootAdmin()) {
        return ['status' => 'error', 'message' => 'Unauthorized'];
    }
    
    // Check if trying to delete self
    if ($username === getCurrentUser()) {
        return ['status' => 'error', 'message' => 'Cannot delete your own account'];
    }
    
    // Check if admin exists
    $query = "SELECT * FROM admins WHERE username = ?";
    $stmt = $conn->prepare($query);
    $stmt->bind_param("s", $username);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        return ['status' => 'error', 'message' => 'Admin not found'];
    }
    
    // Delete admin
    $query = "DELETE FROM admins WHERE username = ?";
    $stmt = $conn->prepare($query);
    $stmt->bind_param("s", $username);
    
    if ($stmt->execute()) {
        return [
            'status' => 'success',
            'message' => 'Admin deleted successfully'
        ];
    } else {
        logError($conn->error, __FILE__, __LINE__);
        return [
            'status' => 'error',
            'message' => 'Failed to delete admin'
        ];
    }
}

/**
 * Change password
 * 
 * @param mysqli $conn Database connection
 * @param array $data Password data (current_password, new_password)
 * @return array Response data
 */
function changePassword($conn, $data) {
    // Validate required fields
    $requiredFields = ['current_password', 'new_password'];
    
    $validation = validateRequiredFields($data, $requiredFields);
    if ($validation !== true) {
        return $validation;
    }
    
    // Get current user
    $username = getCurrentUser();
    
    // Check if current password is correct
    $query = "SELECT * FROM admins WHERE username = ?";
    $stmt = $conn->prepare($query);
    $stmt->bind_param("s", $username);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        return ['status' => 'error', 'message' => 'User not found'];
    }
    
    $user = $result->fetch_assoc();
    
    if (!password_verify($data['current_password'], $user['password'])) {
        return ['status' => 'error', 'message' => 'Current password is incorrect'];
    }
    
    // Hash new password
    $hashedPassword = password_hash($data['new_password'], PASSWORD_DEFAULT);
    
    // Update password
    $query = "UPDATE admins SET password = ? WHERE username = ?";
    $stmt = $conn->prepare($query);
    $stmt->bind_param("ss", $hashedPassword, $username);
    
    if ($stmt->execute()) {
        return [
            'status' => 'success',
            'message' => 'Password changed successfully'
        ];
    } else {
        logError($conn->error, __FILE__, __LINE__);
        return [
            'status' => 'error',
            'message' => 'Failed to change password'
        ];
    }
}
