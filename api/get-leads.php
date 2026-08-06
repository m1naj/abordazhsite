<?php
require_once __DIR__ . '/../config.php';
requireAdmin();

$stmt = $pdo->query("SELECT id, name, contact, message, status, DATE_FORMAT(created_at, '%d.%m.%Y %H:%i') AS date FROM leads ORDER BY created_at DESC");
echo json_encode(array('ok' => true, 'leads' => $stmt->fetchAll()));
?>