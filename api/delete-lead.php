<?php
require_once __DIR__ . '/../config.php';
requireAdmin();

$data = json_decode(file_get_contents('php://input'), true);
if (empty($data['id'])) {
    echo json_encode(array('ok' => false, 'error' => 'ID required'));
    exit;
}

$stmt = $pdo->prepare("DELETE FROM leads WHERE id = ?");
$stmt->execute([$data['id']]);
echo json_encode(array('ok' => true));
?>