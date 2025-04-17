<?php
/**
 * Experiences API Implementation
 * 
 * This file implements the API endpoints for co-op experiences
 */

// Include required files
require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../includes/utils.php';
require_once __DIR__ . '/../auth/auth.php';

/**
 * Handle experiences API requests
 * 
 * @param string $method HTTP method (GET, POST, PUT, DELETE)
 * @param array $segments URL path segments
 * @param array $input Request body data
 * @return array Response data
 */
function handleExperiencesRequest($method, $segments, $input) {
    $conn = getDbConnection();
    $response = ['status' => 'error', 'message' => 'Invalid request'];
    
    try {
        // Get experience by ID
        if (count($segments) > 1 && is_numeric($segments[1]) && $method === 'GET') {
            $id = (int)$segments[1];
            $response = getExperienceById($conn, $id);
        }
        // Get all experiences with optional filtering
        else if ($method === 'GET') {
            $filters = sanitizeInput($_GET);
            $response = getExperiences($conn, $filters);
        }
        // Create new experience
        else if ($method === 'POST') {
            $data = sanitizeInput($input);
            $response = createExperience($conn, $data);
        }
        // Update experience status (admin only)
        else if (count($segments) > 1 && is_numeric($segments[1]) && $method === 'PUT') {
            $id = (int)$segments[1];
            $data = sanitizeInput($input);
            $response = updateExperienceStatus($conn, $id, $data);
        }
        // Delete experience (admin only)
        else if (count($segments) > 1 && is_numeric($segments[1]) && $method === 'DELETE') {
            $id = (int)$segments[1];
            $response = deleteExperience($conn, $id);
        }
    } catch (Exception $e) {
        logError($e->getMessage(), __FILE__, __LINE__);
        $response = ['status' => 'error', 'message' => 'An error occurred while processing your request'];
    }
    
    $conn->close();
    return $response;
}

/**
 * Get all experiences with optional filtering
 * 
 * @param mysqli $conn Database connection
 * @param array $filters Filter parameters
 * @return array Response data
 */
function getExperiences($conn, $filters) {
    // Define allowed filters and their corresponding SQL columns
    $allowedFilters = [
        'university' => ['column' => 'university_name', 'operator' => 'LIKE', 'type' => 's'],
        'college' => ['column' => 'college', 'operator' => 'LIKE', 'type' => 's'],
        'major' => ['column' => 'major', 'operator' => 'LIKE', 'type' => 's'],
        'company' => ['column' => 'company_name', 'operator' => 'LIKE', 'type' => 's'],
        'recommended' => ['column' => 'recommended', 'type' => 'i'],
        'contracted' => ['column' => 'contracted', 'type' => 'i']
    ];
    
    // Get pagination parameters
    $pagination = getPaginationParams($filters);
    
    // Build WHERE clause from filters
    $whereClause = buildWhereClause($filters, $allowedFilters);
    
    // Add default status filter if not specified
    if (empty($whereClause['where'])) {
        $whereClause['where'] = "WHERE status = 'visible'";
    } else {
        $whereClause['where'] .= " AND status = 'visible'";
    }
    
    // Build query
    $query = "SELECT * FROM experiences {$whereClause['where']} ORDER BY created_at DESC LIMIT ? OFFSET ?";
    
    // Add pagination parameters
    $whereClause['params'][] = $pagination['limit'];
    $whereClause['params'][] = $pagination['offset'];
    $whereClause['types'] .= 'ii';
    
    // Prepare and execute query
    $stmt = $conn->prepare($query);
    
    if (!empty($whereClause['params'])) {
        $stmt->bind_param($whereClause['types'], ...$whereClause['params']);
    }
    
    $stmt->execute();
    $result = $stmt->get_result();
    
    $experiences = [];
    while ($row = $result->fetch_assoc()) {
        $experiences[] = $row;
    }
    
    // Get total count for pagination
    $countQuery = "SELECT COUNT(*) as total FROM experiences {$whereClause['where']}";
    $countStmt = $conn->prepare($countQuery);
    
    if (!empty($whereClause['params'])) {
        // Remove pagination parameters for count query
        array_pop($whereClause['params']);
        array_pop($whereClause['params']);
        $countTypes = substr($whereClause['types'], 0, -2);
        
        if (!empty($whereClause['params'])) {
            $countStmt->bind_param($countTypes, ...$whereClause['params']);
        }
    }
    
    $countStmt->execute();
    $countResult = $countStmt->get_result();
    $totalCount = $countResult->fetch_assoc()['total'];
    
    return [
        'status' => 'success',
        'data' => $experiences,
        'pagination' => [
            'page' => $pagination['page'],
            'limit' => $pagination['limit'],
            'total' => $totalCount
        ]
    ];
}

/**
 * Get experience by ID
 * 
 * @param mysqli $conn Database connection
 * @param int $id Experience ID
 * @return array Response data
 */
function getExperienceById($conn, $id) {
    $query = "SELECT * FROM experiences WHERE id = ? AND status = 'visible'";
    $stmt = $conn->prepare($query);
    $stmt->bind_param("i", $id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        return ['status' => 'error', 'message' => 'Experience not found'];
    }
    
    $experience = $result->fetch_assoc();
    
    return [
        'status' => 'success',
        'data' => $experience
    ];
}

/**
 * Create new experience
 * 
 * @param mysqli $conn Database connection
 * @param array $data Experience data
 * @return array Response data
 */
function createExperience($conn, $data) {
    // Validate required fields
    $requiredFields = [
        'university_name', 'college', 'major', 'grade_scale', 'grade', 
        'company_name', 'how_to_apply', 'duration', 'tasks'
    ];
    
    $validation = validateRequiredFields($data, $requiredFields);
    if ($validation !== true) {
        return $validation;
    }
    
    // Calculate true grade scaler
    $trueGradeScaler = $data['grade'] / $data['grade_scale'];
    
    // Set default values for optional fields
    $salary = isset($data['salary']) ? (float)$data['salary'] : 0;
    $positives = isset($data['positives']) ? $data['positives'] : '';
    $negatives = isset($data['negatives']) ? $data['negatives'] : '';
    $recommended = isset($data['recommended']) && ($data['recommended'] === true || $data['recommended'] === 'true' || $data['recommended'] === 1) ? 1 : 0;
    $whyRecommend = isset($data['why_recommend']) ? $data['why_recommend'] : '';
    $additionalInfo = isset($data['additional_info']) ? $data['additional_info'] : '';
    $contracted = isset($data['contracted']) && ($data['contracted'] === true || $data['contracted'] === 'true' || $data['contracted'] === 1) ? 1 : 0;
    
    // Get uploader IP
    $uploaderIp = getClientIP();
    
    // Insert into database
    $query = "INSERT INTO experiences (
                university_name, college, major, grade_scale, grade, true_grade_scaler,
                company_name, how_to_apply, salary, duration, tasks, positives, negatives,
                recommended, why_recommend, additional_info, contracted, uploader_ip, status
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'visible')";
    
    $stmt = $conn->prepare($query);
    $stmt->bind_param(
        "sssiddssiisssisss",
        $data['university_name'],
        $data['college'],
        $data['major'],
        $data['grade_scale'],
        $data['grade'],
        $trueGradeScaler,
        $data['company_name'],
        $data['how_to_apply'],
        $salary,
        $data['duration'],
        $data['tasks'],
        $positives,
        $negatives,
        $recommended,
        $whyRecommend,
        $additionalInfo,
        $contracted,
        $uploaderIp
    );
    
    if ($stmt->execute()) {
        $experienceId = $conn->insert_id;
        return [
            'status' => 'success',
            'message' => 'Experience created successfully',
            'data' => ['id' => $experienceId]
        ];
    } else {
        logError($conn->error, __FILE__, __LINE__);
        return [
            'status' => 'error',
            'message' => 'Failed to create experience'
        ];
    }
}

/**
 * Update experience status (admin only)
 * 
 * @param mysqli $conn Database connection
 * @param int $id Experience ID
 * @param array $data Update data
 * @return array Response data
 */
function updateExperienceStatus($conn, $id, $data) {
    // Check if user is admin
    if (!isAdmin()) {
        return ['status' => 'error', 'message' => 'Unauthorized'];
    }
    
    // Validate status
    if (!isset($data['status']) || !in_array($data['status'], ['visible', 'hidden'])) {
        return ['status' => 'error', 'message' => 'Invalid status'];
    }
    
    // Update status
    $query = "UPDATE experiences SET status = ? WHERE id = ?";
    $stmt = $conn->prepare($query);
    $stmt->bind_param("si", $data['status'], $id);
    
    if ($stmt->execute()) {
        return [
            'status' => 'success',
            'message' => 'Experience status updated successfully'
        ];
    } else {
        logError($conn->error, __FILE__, __LINE__);
        return [
            'status' => 'error',
            'message' => 'Failed to update experience status'
        ];
    }
}

/**
 * Delete experience (admin only)
 * 
 * @param mysqli $conn Database connection
 * @param int $id Experience ID
 * @return array Response data
 */
function deleteExperience($conn, $id) {
    // Check if user is admin
    if (!isAdmin()) {
        return ['status' => 'error', 'message' => 'Unauthorized'];
    }
    
    // Delete experience
    $query = "DELETE FROM experiences WHERE id = ?";
    $stmt = $conn->prepare($query);
    $stmt->bind_param("i", $id);
    
    if ($stmt->execute()) {
        return [
            'status' => 'success',
            'message' => 'Experience deleted successfully'
        ];
    } else {
        logError($conn->error, __FILE__, __LINE__);
        return [
            'status' => 'error',
            'message' => 'Failed to delete experience'
        ];
    }
}
