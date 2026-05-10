<?php
ob_start();
error_reporting(E_ALL);
ini_set('display_errors', 0);
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');

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

$result = $conn->query('SELECT name, email, subject, message, created_at FROM messages ORDER BY created_at DESC');

if (!$result) {
    if (ob_get_length()) {
        ob_clean();
    }
    http_response_code(500);
    echo json_encode(['error' => 'Lekérdezési hiba: ' . $conn->error]);
    exit();
}

$messages = [];
while ($row = $result->fetch_assoc()) {
    $messages[] = $row;
}

echo json_encode(['success' => true, 'messages' => $messages]);

$conn->close();
?>
