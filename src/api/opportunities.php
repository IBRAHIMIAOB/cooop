<?php
/**
 * Opportunities API Implementation
 * 
 * This file implements the API endpoints for co-op opportunities
 */

// Include required files
require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../includes/utils.php';
require_once __DIR__ . '/../auth/auth.php';

/**
 * Handle opportunities API requests
 * 
 * @param string $method HTTP method (GET, POST, PUT, DELETE)
 * @param array $segments URL path segments
 * @param array $input Request body data
 * @return array Response data
 */
function handleOpportunitiesRequest($method, $segments, $input) {
    $conn = getDbConnection();
    $response = ['status' => 'error', 'message' => 'Invalid request'];
    
    try {
        // Get opportunity by ID
        if (count($segments) > 1 && is_numeric($segments[1]) && $method === 'GET') {
            $id = (int)$segments[1];
            $response = getOpportunityById($conn, $id);
        }
        // Get all opportunities with optional filtering
        else if ($method === 'GET') {
            $filters = sanitizeInput($_GET);
            $response = getOpportunities($conn, $filters);
        }
        // Create new opportunity (admin only)
        else if ($method === 'POST') {
            $data = sanitizeInput($input);
            $response = createOpportunity($conn, $data);
        }
        // Update opportunity (admin only)
        else if (count($segments) > 1 && is_numeric($segments[1]) && $method === 'PUT') {
            $id = (int)$segments[1];
            $data = sanitizeInput($input);
            $response = updateOpportunity($conn, $id, $data);
        }
        // Delete opportunity (admin only)
        else if (count($segments) > 1 && is_numeric($segments[1]) && $method === 'DELETE') {
            $id = (int)$segments[1];
            $response = deleteOpportunity($conn, $id);
        }
    } catch (Exception $e) {
        logError($e->getMessage(), __FILE__, __LINE__);
        $response = ['status' => 'error', 'message' => 'An error occurred while processing your request'];
    }
    
    $conn->close();
    return $response;
}

/**
 * Get all opportunities with optional filtering
 * 
 * @param mysqli $conn Database connection
 * @param array $filters Filter parameters
 * @return array Response data
 */
function getOpportunities($conn, $filters) {
    // Define allowed filters and their corresponding SQL columns
    $allowedFilters = [
        'company' => ['column' => 'company_name', 'operator' => 'LIKE', 'type' => 's'],
        'major' => ['column' => 'major_needed', 'operator' => 'LIKE', 'type' => 's'],
        'status' => ['column' => 'status', 'type' => 's']
    ];
    
    // Get pagination parameters
    $pagination = getPaginationParams($filters);
    
    // Build WHERE clause from filters
    $whereClause = buildWhereClause($filters, $allowedFilters);
    
    // Add default status filter if not specified
    if (empty($whereClause['where'])) {
        $whereClause['where'] = "WHERE status = 'open'";
    } else if (strpos($whereClause['where'], 'status') === false) {
        $whereClause['where'] .= " AND status = 'open'";
    }
    
    // Build query
    $query = "SELECT * FROM opportunities {$whereClause['where']} ORDER BY upload_time DESC LIMIT ? OFFSET ?";
    
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
    
    $opportunities = [];
    while ($row = $result->fetch_assoc()) {
        $opportunities[] = $row;
    }
    
    // Get total count for pagination
    $countQuery = "SELECT COUNT(*) as total FROM opportunities {$whereClause['where']}";
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
        'data' => $opportunities,
        'pagination' => [
            'page' => $pagination['page'],
            'limit' => $pagination['limit'],
            'total' => $totalCount
        ]
    ];
}

/**
 * Get opportunity by ID
 * 
 * @param mysqli $conn Database connection
 * @param int $id Opportunity ID
 * @return array Response data
 */
function getOpportunityById($conn, $id) {
    $query = "SELECT * FROM opportunities WHERE id = ?";
    $stmt = $conn->prepare($query);
    $stmt->bind_param("i", $id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        return ['status' => 'error', 'message' => 'Opportunity not found'];
    }
    
    $opportunity = $result->fetch_assoc();
    
    return [
        'status' => 'success',
        'data' => $opportunity
    ];
}

/**
 * Create new opportunity (admin only)
 * 
 * @param mysqli $conn Database connection
 * @param array $data Opportunity data
 * @return array Response data
 */
function createOpportunity($conn, $data) {
    // Check if user is admin
    if (!isAdmin()) {
        return ['status' => 'error', 'message' => 'Unauthorized'];
    }
    
    // Validate required fields
    $requiredFields = ['company_name', 'major_needed', 'job_description', 'status'];
    
    $validation = validateRequiredFields($data, $requiredFields);
    if ($validation !== true) {
        return $validation;
    }
    
    // Validate status
    if (!in_array($data['status'], ['open', 'closed'])) {
        return ['status' => 'error', 'message' => 'Invalid status'];
    }
    
    // Set default values for optional fields
    $salary = isset($data['salary']) ? (float)$data['salary'] : 0;
    $duration = isset($data['duration']) ? $data['duration'] : '';
    $url = isset($data['url']) ? $data['url'] : '';
    
    // Get admin username
    $adminUsername = getCurrentUser();
    
    // Insert into database
    $query = "INSERT INTO opportunities (
                company_name, major_needed, job_description, salary, duration,
                status, url, admin_username
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
    
    $stmt = $conn->prepare($query);
    $stmt->bind_param(
        "sssdsss",
        $data['company_name'],
        $data['major_needed'],
        $data['job_description'],
        $salary,
        $duration,
        $data['status'],
        $url,
        $adminUsername
    );
    
    if ($stmt->execute()) {
        $opportunityId = $conn->insert_id;
        return [
            'status' => 'success',
            'message' => 'Opportunity created successfully',
            'data' => ['id' => $opportunityId]
        ];
    } else {
        logError($conn->error, __FILE__, __LINE__);
        return [
            'status' => 'error',
            'message' => 'Failed to create opportunity'
        ];
    }
}

/**
 * Update opportunity (admin only)
 * 
 * @param mysqli $conn Database connection
 * @param int $id Opportunity ID
 * @param array $data Update data
 * @return array Response data
 */
function updateOpportunity($conn, $id, $data) {
    // Check if user is admin
    if (!isAdmin()) {
        return ['status' => 'error', 'message' => 'Unauthorized'];
    }
    
    // Check if opportunity exists
    $query = "SELECT * FROM opportunities WHERE id = ?";
    $stmt = $conn->prepare($query);
    $stmt->bind_param("i", $id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        return ['status' => 'error', 'message' => 'Opportunity not found'];
    }
    
    // Build update query
    $updateFields = [];
    $params = [];
    $types = "";
    
    if (isset($data['company_name'])) {
        $updateFields[] = "company_name = ?";
        $params[] = $data['company_name'];
        $types .= "s";
    }
    
    if (isset($data['major_needed'])) {
        $updateFields[] = "major_needed = ?";
        $params[] = $data['major_needed'];
        $types .= "s";
    }
    
    if (isset($data['job_description'])) {
        $updateFields[] = "job_description = ?";
        $params[] = $data['job_description'];
        $types .= "s";
    }
    
    if (isset($data['salary'])) {
        $updateFields[] = "salary = ?";
        $params[] = (float)$data['salary'];
        $types .= "d";
    }
    
    if (isset($data['duration'])) {
        $updateFields[] = "duration = ?";
        $params[] = $data['duration'];
        $types .= "s";
    }
    
    if (isset($data['status']) && in_array($data['status'], ['open', 'closed'])) {
        $updateFields[] = "status = ?";
        $params[] = $data['status'];
        $types .= "s";
    }
    
    if (isset($data['url'])) {
        $updateFields[] = "url = ?";
        $params[] = $data['url'];
        $types .= "s";
    }
    
    if (empty($updateFields)) {
        return ['status' => 'error', 'message' => 'No fields to update'];
    }
    
    // Add ID to params
    $params[] = $id;
    $types .= "i";
    
    // Execute update query
    $query = "UPDATE opportunities SET " . implode(", ", $updateFields) . " WHERE id = ?";
    $stmt = $conn->prepare($query);
    $stmt->bind_param($types, ...$params);
    
    if ($stmt->execute()) {
        return [
            'status' => 'success',
            'message' => 'Opportunity updated successfully'
        ];
    } else {
        logError($conn->error, __FILE__, __LINE__);
        return [
            'status' => 'error',
            'message' => 'Failed to update opportunity'
        ];
    }
}

/**
 * Delete opportunity (admin only)
 * 
 * @param mysqli $conn Database connection
 * @param int $id Opportunity ID
 * @return array Response data
 */
function deleteOpportunity($conn, $id) {
    // Check if user is admin
    if (!isAdmin()) {
        return ['status' => 'error', 'message' => 'Unauthorized'];
    }
    
    // Delete opportunity
    $query = "DELETE FROM opportunities WHERE id = ?";
    $stmt = $conn->prepare($query);
    $stmt->bind_param("i", $id);
    
    if ($stmt->execute()) {
        return [
            'status' => 'success',
            'message' => 'Opportunity deleted successfully'
        ];
    } else {
        logError($conn->error, __FILE__, __LINE__);
        return [
            'status' => 'error',
            'message' => 'Failed to delete opportunity'
        ];
    }
}
