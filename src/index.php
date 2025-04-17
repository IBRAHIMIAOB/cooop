<?php
/**
 * Main entry point for the Cooop website API
 * 
 * This file handles all API requests and routes them to the appropriate handlers
 */

// Include required files
require_once __DIR__ . '/config/config.php';
require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/includes/utils.php';
require_once __DIR__ . '/includes/language.php';
require_once __DIR__ . '/api/experiences.php';
require_once __DIR__ . '/api/opportunities.php';
require_once __DIR__ . '/api/admin.php';
require_once __DIR__ . '/auth/auth.php';

// Set headers for CORS and JSON response
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Get request method and path
$method = $_SERVER['REQUEST_METHOD'];
$request_uri = $_SERVER['REQUEST_URI'];

// Parse request URI
$uri_parts = parse_url($request_uri);
$path = $uri_parts['path'];

// Remove base path if present
$base_path = '/api';
if (strpos($path, $base_path) === 0) {
    $path = substr($path, strlen($base_path));
}

// Split path into segments
$segments = explode('/', trim($path, '/'));

// Get request body for POST, PUT methods
$input = json_decode(file_get_contents('php://input'), true);
if (json_last_error() !== JSON_ERROR_NONE) {
    $input = [];
}

// Route request to appropriate handler
$response = ['status' => 'error', 'message' => 'Invalid endpoint'];

if (count($segments) > 0) {
    $endpoint = $segments[0];
    
    switch ($endpoint) {
        case 'experiences':
            $response = handleExperiencesRequest($method, $segments, $input);
            break;
        
        case 'opportunities':
            $response = handleOpportunitiesRequest($method, $segments, $input);
            break;
        
        case 'admin':
            $response = handleAdminRequest($method, $segments, $input);
            break;
        
        case 'auth':
            $response = handleAuthRequest($method, $segments, $input);
            break;
        
        case 'language':
            $response = handleLanguageRequest($method, $segments, $input);
            break;
    }
}

// Send response
sendJsonResponse($response);
