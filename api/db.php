<?php
// Tentukan zona waktu lokal
date_default_timezone_set('Asia/Jakarta');

$host = 'localhost';
$db   = 'ami_green_farm';
$user = 'root'; // User default XAMPP
$pass = '';     // Password default XAMPP

$conn = new mysqli($host, $user, $pass, $db);

if ($conn->connect_error) {
    die("Koneksi gagal: " . $conn->connect_error);
}

header('Content-Type: application/json');
?>