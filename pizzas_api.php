<?php
ob_start();
error_reporting(E_ALL);
ini_set('display_errors', 0);
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit();
}

$servername = 'localhost';
$username = 'pizza12';
$password = 'Pizza12.';
$dbname = 'pizza12';

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    if (ob_get_length()) {
        ob_clean();
    }
    http_response_code(500);
    echo json_encode(['error' => 'Adatbázis kapcsolat hiba: ' . $conn->connect_error]);
    exit();
}

$conn->set_charset('utf8');

$conn->query(
    "CREATE TABLE IF NOT EXISTS pizzas (
        id INT(11) NOT NULL AUTO_INCREMENT,
        name VARCHAR(100) NOT NULL,
        category VARCHAR(50) NOT NULL,
        price INT(11) NOT NULL,
        vegetarian TINYINT(1) NOT NULL DEFAULT 0,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci"
);

$defaultPizzas = [
    ['Margherita', 'főnemes', 950, 1],
    ['Pepperoni', 'király', 1250, 0],
    ['Hawaii', 'lovag', 1150, 0],
    ['Vegetár', 'apród', 850, 1]
];

$countResult = $conn->query('SELECT COUNT(*) AS count FROM pizzas');
if ($countResult) {
    $countRow = $countResult->fetch_assoc();
    if ((int)$countRow['count'] === 0) {
        $seedStmt = $conn->prepare('INSERT INTO pizzas (name, category, price, vegetarian) VALUES (?, ?, ?, ?)');
        foreach ($defaultPizzas as $pizza) {
            $seedStmt->bind_param('ssii', $pizza[0], $pizza[1], $pizza[2], $pizza[3]);
            $seedStmt->execute();
        }
        $seedStmt->close();
    }
}

function json_input()
{
    $input = json_decode(file_get_contents('php://input'), true);
    return is_array($input) ? $input : [];
}
