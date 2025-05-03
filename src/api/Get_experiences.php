<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}

$dsn = 'mysql:host=localhost;dbname=cooop_db;charset=utf8mb4';
$db_user = 'root';
$db_pass = '';
$options = [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
];

try {
    $pdo = new PDO($dsn, $db_user, $db_pass, $options);

    $page = isset($_GET['page']) ? max(1, intval($_GET['page'])) : 1;
    $limit = isset($_GET['limit']) ? max(1, intval($_GET['limit'])) : 15;
    $offset = ($page - 1) * $limit;

    $query = "SELECT SQL_CALC_FOUND_ROWS 
                id, university_name, college, major, grade_scale, grade,
                true_grade_scaler, company_name, how_to_apply, salary, duration,
                tasks, positives, negatives, recommended, why_recommend,
                additional_info, contracted, created_at
              FROM experiences
              WHERE status = 'visible'";

    $params = [];
    $conditions = [];

    if (!empty($_GET['university'])) {
        $conditions[] = "university_name LIKE :university";
        $params[':university'] = '%' . $_GET['university'] . '%';
    }

    if (!empty($_GET['college'])) {
        $conditions[] = "college LIKE :college";
        $params[':college'] = '%' . $_GET['college'] . '%';
    }

    if (!empty($_GET['major'])) {
        $conditions[] = "major LIKE :major";
        $params[':major'] = '%' . $_GET['major'] . '%';
    }

    if (!empty($_GET['company'])) {
        $conditions[] = "company_name LIKE :company";
        $params[':company'] = '%' . $_GET['company'] . '%';
    }

    if (isset($_GET['recommended']) && $_GET['recommended'] === 'true') {
        $conditions[] = "recommended = 1";
    }

    if (isset($_GET['contracted']) && $_GET['contracted'] === 'true') {
        $conditions[] = "contracted = 1";
    }

    if (!empty($conditions)) {
        $query .= " AND " . implode(" AND ", $conditions);
    }

    $query .= " ORDER BY created_at DESC LIMIT :limit OFFSET :offset";

    $stmt = $pdo->prepare($query);
    
    foreach ($params as $key => $value) {
        $stmt->bindValue($key, $value);
    }
    
    $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
    $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
    $stmt->execute();

    $experiences = $stmt->fetchAll();

    $total_stmt = $pdo->query("SELECT FOUND_ROWS()");
    $total = $total_stmt->fetchColumn();
    $totalPages = ceil($total / $limit);

    $response = [
        'data' => $experiences,
        'pagination' => [
            'page' => $page,
            'limit' => $limit,
            'total' => $total,
            'totalPages' => $totalPages
        ]
    ];

    echo json_encode($response);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Server error: ' . $e->getMessage()]);
}
?>