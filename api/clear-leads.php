<?php
require_once '../config.php';

if (empty($_SESSION['admin_auth'])) {
    jsonResponse(['error' => 'Unauthorized'], 401);
}

$pdo->query("TRUNCATE TABLE leads");
jsonResponse(['success' => true]);
?>