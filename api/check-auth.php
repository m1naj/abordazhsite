<?php
require_once __DIR__ . '/../config.php';
echo json_encode(array('ok' => true, 'authenticated' => isAdminAuthed()));
?>