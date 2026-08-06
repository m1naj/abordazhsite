<?php
require_once '../config.php';

if (empty($_SESSION['admin_auth'])) {
    jsonResponse(['error' => 'Unauthorized'], 401);
}

$data = json_decode(file_get_contents('php://input'), true);
if (empty($data['id'])) {
    jsonResponse(['error' => 'ID required'], 400);
}

$stmt = $pdo->prepare("DELETE FROM leads WHERE id = ?");
$stmt->execute([$data['id']]);

jsonResponse(['success' => true]);
?>