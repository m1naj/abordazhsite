<?php
require_once '../config.php';

$data = json_decode(file_get_contents('php://input'), true);
if (empty($data['name']) || empty($data['contact'])) {
    jsonResponse(['error' => 'Name and contact required'], 400);
}

// Защита от спама (можно добавить капчу позже)
$name = trim(strip_tags($data['name']));
$contact = trim(strip_tags($data['contact']));
$message = trim(strip_tags($data['message'] ?? ''));

$stmt = $pdo->prepare("INSERT INTO leads (name, contact, message) VALUES (?, ?, ?)");
$stmt->execute([$name, $contact, $message]);

jsonResponse(['success' => true, 'id' => $pdo->lastInsertId()]);
?>