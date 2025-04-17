<?php
/**
 * Config File
 * 
 * This file contains global configuration settings for the Cooop website.
 */

// Site settings
define('SITE_NAME', 'Cooop');
define('SITE_URL', 'http://localhost:8000');
define('SITE_DESCRIPTION', 'Share and find co-op experiences and opportunities');

// Default language (en = English, ar = Arabic)
define('DEFAULT_LANG', 'en');

// File upload settings
define('UPLOAD_DIR', __DIR__ . '/../uploads/');
define('MAX_FILE_SIZE', 5 * 1024 * 1024); // 5MB
define('ALLOWED_EXTENSIONS', ['jpg', 'jpeg', 'png', 'pdf', 'doc', 'docx']);

// Session settings
define('SESSION_LIFETIME', 86400); // 24 hours in seconds

// Error reporting
define('DISPLAY_ERRORS', true);
if (DISPLAY_ERRORS) {
    ini_set('display_errors', 1);
    ini_set('display_startup_errors', 1);
    error_reporting(E_ALL);
} else {
    ini_set('display_errors', 0);
    ini_set('display_startup_errors', 0);
    error_reporting(0);
}
