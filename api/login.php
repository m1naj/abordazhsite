<?php
require_once '../config.php';

$data = json_decode(file_get_contents('php://input'), true);
if (empty($data['password'])) {
    jsonResponse(['error' => 'Password required'], 400);
}

if (password_verify($data['password'], ADMIN_PASS_HASH)) {
    $_SESSION['admin_auth'] = true;
    jsonResponse(['success' => true]);
} else {
    jsonResponse(['error' => 'Invalid password'], 401);
}
?>