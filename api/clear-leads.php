<?php
require_once __DIR__ . '/../config.php';
requireAdmin();

$pdo->query("TRUNCATE TABLE leads");
echo json_encode(array('ok' => true));
?>