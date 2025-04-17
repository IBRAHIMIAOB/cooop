<?php
/**
 * Utility functions for the Cooop website
 */

/**
 * Sanitize input data
 * 
 * @param mixed $data Data to sanitize
 * @return mixed Sanitized data
 */
function sanitizeInput($data) {
    if (is_array($data)) {
        foreach ($data as $key => $value) {
            $data[$key] = sanitizeInput($value);
        }
        return $data;
    }
    
    if (is_string($data)) {
        $data = trim($data);
        $data = stripslashes($data);
        $data = htmlspecialchars($data, ENT_QUOTES, 'UTF-8');
    }
    
    return $data;
}

/**
 * Validate required fields
 * 
 * @param array $data Data to validate
 * @param array $requiredFields List of required field names
 * @return array|true True if all required fields are present, otherwise array with error message
 */
function validateRequiredFields($data, $requiredFields) {
    foreach ($requiredFields as $field) {
        if (!isset($data[$field]) || empty($data[$field])) {
            return ['status' => 'error', 'message' => "Missing required field: $field"];
        }
    }
    
    return true;
}

/**
 * Send JSON response
 * 
 * @param array $data Response data
 * @param int $statusCode HTTP status code
 */
function sendJsonResponse($data, $statusCode = 200) {
    http_response_code($statusCode);
    echo json_encode($data);
    exit;
}

/**
 * Get pagination parameters from request
 * 
 * @param array $params Request parameters
 * @return array Pagination parameters (page, limit, offset)
 */
function getPaginationParams($params) {
    $page = isset($params['page']) ? (int)$params['page'] : 1;
    $limit = isset($params['limit']) ? (int)$params['limit'] : 15;
    $offset = ($page - 1) * $limit;
    
    return [
        'page' => $page,
        'limit' => $limit,
        'offset' => $offset
    ];
}

/**
 * Build SQL WHERE clause from filters
 * 
 * @param array $filters Filter parameters
 * @param array $allowedFilters List of allowed filter names and their SQL column names
 * @return array Array with SQL WHERE clause and parameters
 */
function buildWhereClause($filters, $allowedFilters) {
    $where = [];
    $params = [];
    $types = '';
    
    foreach ($filters as $key => $value) {
        if (isset($allowedFilters[$key]) && !empty($value)) {
            $column = $allowedFilters[$key]['column'];
            $operator = $allowedFilters[$key]['operator'] ?? '=';
            
            if ($operator === 'LIKE') {
                $where[] = "$column LIKE ?";
                $params[] = "%$value%";
                $types .= 's';
            } else {
                $where[] = "$column $operator ?";
                $params[] = $value;
                $types .= $allowedFilters[$key]['type'] ?? 's';
            }
        }
    }
    
    return [
        'where' => !empty($where) ? 'WHERE ' . implode(' AND ', $where) : '',
        'params' => $params,
        'types' => $types
    ];
}

/**
 * Get client IP address
 * 
 * @return string Client IP address
 */
function getClientIP() {
    if (!empty($_SERVER['HTTP_CLIENT_IP'])) {
        $ip = $_SERVER['HTTP_CLIENT_IP'];
    } elseif (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
        $ip = $_SERVER['HTTP_X_FORWARDED_FOR'];
    } else {
        $ip = $_SERVER['REMOTE_ADDR'];
    }
    
    return $ip;
}

/**
 * Log error to file
 * 
 * @param string $message Error message
 * @param string $file File where error occurred
 * @param int $line Line number where error occurred
 */
function logError($message, $file = '', $line = 0) {
    $logFile = __DIR__ . '/../logs/error.log';
    $logDir = dirname($logFile);
    
    if (!is_dir($logDir)) {
        mkdir($logDir, 0755, true);
    }
    
    $timestamp = date('Y-m-d H:i:s');
    $ip = getClientIP();
    $logMessage = "[$timestamp] [$ip] $message";
    
    if ($file && $line) {
        $logMessage .= " in $file on line $line";
    }
    
    $logMessage .= PHP_EOL;
    
    file_put_contents($logFile, $logMessage, FILE_APPEND);
}
