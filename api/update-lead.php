<?php
require_once __DIR__ . '/../config.php';
requireAdmin();

$data = json_decode(file_get_contents('php://input'), true);
$status = isset($data['status']) ? $data['status'] : '';

if (empty($data['id']) || !in_array($status, array('new', 'done'))) {
    echo json_encode(array('ok' => false, 'error' => 'Invalid data'));
    exit;
}

$stmt = $pdo->prepare("UPDATE leads SET status = ? WHERE id = ?");
$stmt->execute([$status, $data['id']]);
echo json_encode(array('ok' => true));
?>