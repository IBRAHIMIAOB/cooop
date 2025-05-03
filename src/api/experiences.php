<?php
// Allow requests from any origin
header("Access-Control-Allow-Origin: *");

// Allow specific HTTP methods
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");

// Allow specific headers
header("Access-Control-Allow-Headers: Content-Type, Authorization");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}
header('Content-Type: application/json');

// Start with success
$error = 'success!';

// Turn on error logging
ini_set('display_errors', 0);
ini_set('log_errors', 1);

// Retrieve POST data
$university_name     = $_POST['university_name']   ?? '';
$college             = $_POST['college']           ?? '';
$major               = $_POST['major']             ?? '';
$grade_scale         = isset($_POST['grade_scale']) ? (float)$_POST['grade_scale'] : 5.0;
$grade               = isset($_POST['grade'])       ? (float)$_POST['grade']       : 0.0;
$company_name        = $_POST['company_name']      ?? '';
$how_to_apply        = $_POST['how_to_apply']      ?? '';
$salary              = isset($_POST['salary'])     ? (float)$_POST['salary']     : 0.0;
$duration            = isset($_POST['duration'])   ? (int)$_POST['duration']     : 0;
$tasks               = $_POST['tasks']             ?? '';
$positives           = $_POST['positives']         ?? '';
$negatives           = $_POST['negatives']         ?? '';
$recommended         = isset($_POST['recommended']) ? 1 : 0;
$why_recommend       = $_POST['why_recommend']     ?? '';
$additional_info     = $_POST['additional_info']   ?? '';
$contracted          = isset($_POST['contracted'])  ? 1 : 0;

$true_grade_scaler = $grade_scale > 0 
    ? ($grade / $grade_scale) 
    : 0;

$uploader_ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';

$dsn      = 'mysql:host=localhost;dbname=cooop_db;charset=utf8mb4';
$db_user  = 'root';
$db_pass  = '';
$options  = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
];

try {
    // Connect
    $pdo = new PDO($dsn, $db_user, $db_pass, $options);

    // Prepare INSERT
    $sql = "
        INSERT INTO `experiences` (
            `id`,
            `university_name`,
            `college`,
            `major`,
            `grade_scale`,
            `grade`,
            `true_grade_scaler`,
            `company_name`,
            `how_to_apply`,
            `salary`,
            `duration`,
            `tasks`,
            `positives`,
            `negatives`,
            `recommended`,
            `why_recommend`,
            `additional_info`,
            `contracted`,
            `uploader_ip`,
            `status`,
            `created_at`
        ) VALUES (
            NULL,
            :university_name,
            :college,
            :major,
            :grade_scale,
            :grade,
            :true_grade_scaler,
            :company_name,
            :how_to_apply,
            :salary,
            :duration,
            :tasks,
            :positives,
            :negatives,
            :recommended,
            :why_recommend,
            :additional_info,
            :contracted,
            :uploader_ip,
            'visible',
            CURRENT_TIMESTAMP()
        )
    ";

    $stmt = $pdo->prepare($sql);

    // Bind parameters
    $stmt->bindParam(':university_name',   $university_name,    PDO::PARAM_STR);
    $stmt->bindParam(':college',           $college,            PDO::PARAM_STR);
    $stmt->bindParam(':major',             $major,              PDO::PARAM_STR);
    $stmt->bindParam(':grade_scale',       $grade_scale);
    $stmt->bindParam(':grade',             $grade);
    $stmt->bindParam(':true_grade_scaler', $true_grade_scaler);
    $stmt->bindParam(':company_name',      $company_name,       PDO::PARAM_STR);
    $stmt->bindParam(':how_to_apply',      $how_to_apply,       PDO::PARAM_STR);
    $stmt->bindParam(':salary',            $salary);
    $stmt->bindParam(':duration',          $duration,           PDO::PARAM_INT);
    $stmt->bindParam(':tasks',             $tasks,              PDO::PARAM_STR);
    $stmt->bindParam(':positives',         $positives,          PDO::PARAM_STR);
    $stmt->bindParam(':negatives',         $negatives,          PDO::PARAM_STR);
    $stmt->bindParam(':recommended',       $recommended,        PDO::PARAM_INT);
    $stmt->bindParam(':why_recommend',     $why_recommend,      PDO::PARAM_STR);
    $stmt->bindParam(':additional_info',   $additional_info,    PDO::PARAM_STR);
    $stmt->bindParam(':contracted',        $contracted,         PDO::PARAM_INT);
    $stmt->bindParam(':uploader_ip',       $uploader_ip,        PDO::PARAM_STR);

    // Execute
    $stmt->execute();

} catch (PDOException $e) {
    // Update error message
    $error = 'Database Error: ' . $e->getMessage();
    error_log('experiences.php PDOException: ' . $e->getMessage());
    error_log('SQLSTATE: ' . $e->getCode());
} catch (Exception $e) {
    $error = 'General Error: ' . $e->getMessage();
    error_log('experiences.php Exception: ' . $e->getMessage());
}

// Always return the error message
echo json_encode([
    'error' => $error
]);

$pdo = null;
?>
