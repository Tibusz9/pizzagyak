<?php
ob_start();
error_reporting(E_ALL);
ini_set('display_errors', 0);
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');

// Adatbázis kapcsolat
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

// POST kérés ellenőrzése
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    if (ob_get_length()) {
        ob_clean();
    }
    http_response_code(405);
    echo json_encode(['error' => 'Csak POST kérés megengedett']);
    exit();
}

// Adat beolvasása
$input = json_decode(file_get_contents('php://input'), true);

// Szerver-oldali validáció
$errors = [];

// Név validáció
if (empty($input['name']) || !is_string($input['name'])) {
    $errors[] = 'A név mező kötelező.';
} else {
    $name = trim($input['name']);
    if (strlen($name) < 2 || strlen($name) > 100) {
        $errors[] = 'A név 2-100 karakter között kell legyen.';
    }
}

// Email validáció
if (empty($input['email']) || !is_string($input['email'])) {
    $errors[] = 'Az email mező kötelező.';
} else {
    $email = trim($input['email']);
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $errors[] = 'Érvényes email címet adjon meg.';
    }
    if (strlen($email) > 100) {
        $errors[] = 'Az email túl hosszú.';
    }
}

// Tárgy validáció
if (empty($input['subject']) || !is_string($input['subject'])) {
    $errors[] = 'A tárgy mező kötelező.';
} else {
    $subject = trim($input['subject']);
    if (strlen($subject) < 2 || strlen($subject) > 200) {
        $errors[] = 'A tárgy 2-200 karakter között kell legyen.';
    }
}

// Üzenet validáció
if (empty($input['message']) || !is_string($input['message'])) {
    $errors[] = 'Az üzenet mező kötelező.';
} else {
    $message = trim($input['message']);
    if (strlen($message) < 5 || strlen($message) > 5000) {
        $errors[] = 'Az üzenet 5-5000 karakter között kell legyen.';
    }
}

// Ha vannak hibák, visszaadunk
if (!empty($errors)) {
    if (ob_get_length()) {
        ob_clean();
    }
    http_response_code(400);
    echo json_encode(['error' => $errors]);
    exit();
}

// Adatok előkészítése
$name = trim($input['name']);
$email = trim($input['email']);
$subject = trim($input['subject']);
$message = trim($input['message']);

// Adatok beszúrása az adatbázisba
$stmt = $conn->prepare('INSERT INTO messages (name, email, subject, message) VALUES (?, ?, ?, ?)');

if (!$stmt) {
    if (ob_get_length()) {
        ob_clean();
    }
    http_response_code(500);
    echo json_encode(['error' => 'Prepared statement hiba: ' . $conn->error]);
    exit();
}

$stmt->bind_param('ssss', $name, $email, $subject, $message);

if ($stmt->execute()) {
    if (ob_get_length()) {
        ob_clean();
    }
    http_response_code(201);
    echo json_encode([
        'success' => true,
        'message' => 'Az üzenet sikeresen elküldve!',
        'id' => $stmt->insert_id
    ]);
} else {
    if (ob_get_length()) {
        ob_clean();
    }
    http_response_code(500);
    echo json_encode(['error' => 'Hiba az üzenet mentése során: ' . $stmt->error]);
}

$stmt->close();
$conn->close();
?>
