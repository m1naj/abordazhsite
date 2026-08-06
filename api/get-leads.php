<?php
require_once '../config.php';

if (empty($_SESSION['admin_auth'])) {
    jsonResponse(['error' => 'Unauthorized'], 401);
}

$stmt = $pdo->query("SELECT id, name, contact, message, status, DATE_FORMAT(created_at, '%d.%m.%Y %H:%i') as date FROM leads ORDER BY created_at DESC");
jsonResponse(['leads' => $stmt->fetchAll()]);
?>