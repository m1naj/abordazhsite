<?php
require_once __DIR__ . '/../config.php';
$token = getAdminToken();
if ($token !== '') {
    $pdo->prepare("DELETE FROM admin_tokens WHERE token_hash = ?")
        ->execute([hash('sha256', $token)]);
}
echo json_encode(array('ok' => true));
?>