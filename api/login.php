<?php
require_once __DIR__ . '/../config.php';

$data = json_decode(file_get_contents('php://input'), true);
if (empty($data['username']) || empty($data['password'])) {
    echo json_encode(array('ok' => false, 'error' => 'Логин и пароль обязательны'));
    exit;
}

$stmt = $pdo->prepare("SELECT id, username, password_hash FROM admins WHERE username = ?");
$stmt->execute([trim($data['username'])]);
$admin = $stmt->fetch();

if ($admin && password_verify($data['password'], $admin['password_hash'])) {
    $token = bin2hex(random_bytes(32));
    $pdo->prepare("INSERT INTO admin_tokens (token_hash) VALUES (?)")
        ->execute([hash('sha256', $token)]);
    echo json_encode(array('ok' => true, 'token' => $token, 'username' => $admin['username']));
} else {
    echo json_encode(array('ok' => false, 'error' => 'Неверный логин или пароль'));
}
?>