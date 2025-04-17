<?php
/**
 * Language Support Implementation
 * 
 * This file implements the language support for the Cooop website
 */

// Include required files
require_once __DIR__ . '/../config/config.php';

// Available languages
$availableLanguages = ['en', 'ar'];

// Default language
$defaultLanguage = 'en';

// Current language
$currentLanguage = $defaultLanguage;

// Initialize language
initLanguage();

/**
 * Initialize language based on user preference
 */
function initLanguage() {
    global $availableLanguages, $defaultLanguage, $currentLanguage;
    
    // Check if language is set in session
    if (isset($_SESSION['language']) && in_array($_SESSION['language'], $availableLanguages)) {
        $currentLanguage = $_SESSION['language'];
    }
    // Check if language is set in cookie
    else if (isset($_COOKIE['language']) && in_array($_COOKIE['language'], $availableLanguages)) {
        $currentLanguage = $_COOKIE['language'];
        $_SESSION['language'] = $currentLanguage;
    }
    // Check if language is set in query parameter
    else if (isset($_GET['lang']) && in_array($_GET['lang'], $availableLanguages)) {
        $currentLanguage = $_GET['lang'];
        $_SESSION['language'] = $currentLanguage;
        setcookie('language', $currentLanguage, time() + (86400 * 30), '/'); // 30 days
    }
    // Default to browser language if supported
    else if (isset($_SERVER['HTTP_ACCEPT_LANGUAGE'])) {
        $browserLangs = explode(',', $_SERVER['HTTP_ACCEPT_LANGUAGE']);
        foreach ($browserLangs as $lang) {
            $lang = substr($lang, 0, 2);
            if (in_array($lang, $availableLanguages)) {
                $currentLanguage = $lang;
                $_SESSION['language'] = $currentLanguage;
                setcookie('language', $currentLanguage, time() + (86400 * 30), '/'); // 30 days
                break;
            }
        }
    }
}

/**
 * Get current language
 * 
 * @return string Current language code
 */
function getCurrentLanguage() {
    global $currentLanguage;
    return $currentLanguage;
}

/**
 * Set current language
 * 
 * @param string $language Language code
 * @return bool True if language was set, false otherwise
 */
function setLanguage($language) {
    global $availableLanguages, $currentLanguage;
    
    if (in_array($language, $availableLanguages)) {
        $currentLanguage = $language;
        $_SESSION['language'] = $currentLanguage;
        setcookie('language', $currentLanguage, time() + (86400 * 30), '/'); // 30 days
        return true;
    }
    
    return false;
}

/**
 * Handle language API requests
 * 
 * @param string $method HTTP method (GET, POST, PUT, DELETE)
 * @param array $segments URL path segments
 * @param array $input Request body data
 * @return array Response data
 */
function handleLanguageRequest($method, $segments, $input) {
    global $availableLanguages;
    
    $response = ['status' => 'error', 'message' => 'Invalid request'];
    
    try {
        // Get current language
        if ($method === 'GET') {
            $response = [
                'status' => 'success',
                'data' => [
                    'current' => getCurrentLanguage(),
                    'available' => $availableLanguages
                ]
            ];
        }
        // Set language
        else if ($method === 'POST') {
            $data = sanitizeInput($input);
            
            if (!isset($data['language'])) {
                return ['status' => 'error', 'message' => 'Language parameter is required'];
            }
            
            if (setLanguage($data['language'])) {
                $response = [
                    'status' => 'success',
                    'message' => 'Language set successfully',
                    'data' => [
                        'current' => getCurrentLanguage()
                    ]
                ];
            } else {
                $response = [
                    'status' => 'error',
                    'message' => 'Invalid language'
                ];
            }
        }
    } catch (Exception $e) {
        logError($e->getMessage(), __FILE__, __LINE__);
        $response = ['status' => 'error', 'message' => 'An error occurred while processing your request'];
    }
    
    return $response;
}

/**
 * Get translation for a key
 * 
 * @param string $key Translation key
 * @param array $params Parameters to replace in translation
 * @return string Translated text
 */
function translate($key, $params = []) {
    global $currentLanguage;
    
    // Load translations
    $translations = loadTranslations($currentLanguage);
    
    // Get translation
    $translation = $key;
    $keys = explode('.', $key);
    $current = $translations;
    
    foreach ($keys as $k) {
        if (isset($current[$k])) {
            $current = $current[$k];
        } else {
            return $key;
        }
    }
    
    if (is_string($current)) {
        $translation = $current;
    } else {
        return $key;
    }
    
    // Replace parameters
    foreach ($params as $param => $value) {
        $translation = str_replace(':' . $param, $value, $translation);
    }
    
    return $translation;
}

/**
 * Load translations for a language
 * 
 * @param string $language Language code
 * @return array Translations
 */
function loadTranslations($language) {
    $translationsFile = __DIR__ . "/../lang/$language.php";
    
    if (file_exists($translationsFile)) {
        return include $translationsFile;
    }
    
    return [];
}
