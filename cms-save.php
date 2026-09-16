<?php
/* ============================================================
   cms-save.php — Endpoint publikasi CMS untuk Hostinger/shared hosting
   Menerima POST JSON ber-header X-CMS-Token dari dashboard,
   lalu menulisnya menjadi cms-data.json di folder yang sama.
   ============================================================ */

// 🔑 GANTI dengan token rahasia Anda (samakan dengan field "Token Rahasia" di dashboard)
$SECRET = 'GANTI-DENGAN-TOKEN-RAHASIA-ANDA';

$TARGET = __DIR__ . '/cms-data.json';

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Content-Type, X-CMS-Token');
header('Access-Control-Allow-Methods: POST, OPTIONS');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }

$token = isset($_SERVER['HTTP_X_CMS_TOKEN']) ? $_SERVER['HTTP_X_CMS_TOKEN'] : '';
if (!$SECRET || !hash_equals($SECRET, $token)) {
    http_response_code(401);
    echo json_encode(['ok' => false, 'error' => 'Token salah / tidak dikirim.']);
    exit;
}

$raw  = file_get_contents('php://input');
$data = json_decode($raw, true);
if (!is_array($data)) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'Payload JSON tidak valid.']);
    exit;
}

$ok = file_put_contents(
    $TARGET,
    json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
    LOCK_EX
);

if ($ok === false) {
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => 'Gagal menulis cms-data.json. Cek permission folder (chmod 755).']);
    exit;
}

echo json_encode(['ok' => true, 'bytes' => $ok, 'time' => date('c')]);
