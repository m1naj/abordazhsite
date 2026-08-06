<?php
require_once '../config.php';

if (empty($_SESSION['admin_auth'])) {
    jsonResponse(['error' => 'Unauthorized'], 401);
}

$data = json_decode(file_get_contents('php://input'), true);
if (empty($data['id']) || !in_array($data['status'] ?? '', ['new', 'done'])) {
    jsonResponse(['error' => 'Invalid data'], 400);
}

$stmt = $pdo->prepare("UPDATE leads SET status = ? WHERE id = ?");
$stmt->execute([$data['status'], $data['id']]);

jsonResponse(['success' => true]);
?>