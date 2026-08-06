<?php
require_once __DIR__ . '/../config.php';

$data = json_decode(file_get_contents('php://input'), true);
if (empty($data['name']) || empty($data['contact'])) {
    echo json_encode(array('ok' => false, 'error' => 'Name and contact required'));
    exit;
}

$name = trim(strip_tags($data['name']));
$contact = trim(strip_tags($data['contact']));
$message = trim(strip_tags(isset($data['message']) ? $data['message'] : ''));

$stmt = $pdo->prepare("INSERT INTO leads (name, contact, message) VALUES (?, ?, ?)");
$stmt->execute([$name, $contact, $message]);

echo json_encode(array('ok' => true, 'id' => $pdo->lastInsertId()));
?>