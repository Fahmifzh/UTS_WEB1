<?php
require_once 'db.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'POST') {
    $action = $_GET['action'] ?? '';

    if ($action === 'register') {
        // --- Registrasi Pengguna ---
        $data = json_decode(file_get_contents("php://input"), true);
        $nama = $data['nama'] ?? '';
        $email = $data['email'] ?? '';
        $password = $data['password'] ?? ''; // Catatan: HARUS di-hash di produksi!
        $role = $data['role'] ?? 'public'; // Default role public

        if (empty($nama) || empty($email) || empty($password)) {
            http_response_code(400);
            echo json_encode(['message' => 'Semua field wajib diisi (nama, email, password).']);
            exit;
        }

        // Cek apakah email sudah terdaftar
        $stmt_check = $conn->prepare("SELECT id FROM users WHERE email = ?");
        $stmt_check->bind_param("s", $email);
        $stmt_check->execute();
        $stmt_check->store_result();
        
        if ($stmt_check->num_rows > 0) {
            http_response_code(409);
            echo json_encode(['message' => 'Email sudah terdaftar. Gunakan email lain.']);
            $stmt_check->close();
            exit;
        }
        $stmt_check->close();

        // Simpan ke database
        // Di sini kita simpan password plain-text SEMENTARA untuk UTS.
        $stmt = $conn->prepare("INSERT INTO users (nama, email, password_hash, role) VALUES (?, ?, ?, ?)");
        $stmt->bind_param("ssss", $nama, $email, $password, $role);

        if ($stmt->execute()) {
            echo json_encode(['message' => 'Registrasi berhasil. Silakan Login.', 'user_id' => $conn->insert_id]);
        } else {
            http_response_code(500);
            echo json_encode(['message' => 'Registrasi gagal.', 'error' => $stmt->error]);
        }
        $stmt->close();

    } elseif ($action === 'login') {
        // --- Login Pengguna ---
        $data = json_decode(file_get_contents("php://input"), true);
        $email = $data['email'] ?? '';
        $password = $data['password'] ?? '';

        if (empty($email) || empty($password)) {
            http_response_code(400);
            echo json_encode(['message' => 'Email dan Password wajib diisi.']);
            exit;
        }

        $stmt = $conn->prepare("SELECT id, nama, password_hash, role FROM users WHERE email = ?");
        $stmt->bind_param("s", $email);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($result->num_rows === 1) {
            $user = $result->fetch_assoc();
            // Verifikasi password (Di sini menggunakan perbandingan langsung karena password plain-text)
            if ($password === $user['password_hash']) {
                echo json_encode([
                    'message' => 'Login berhasil.',
                    'user' => [
                        'id' => $user['id'],
                        'nama' => $user['nama'],
                        'email' => $email,
                        'role' => $user['role']
                    ]
                ]);
            } else {
                http_response_code(401);
                echo json_encode(['message' => 'Password salah.']);
            }
        } else {
            http_response_code(404);
            echo json_encode(['message' => 'Email tidak terdaftar.']);
        }
        $stmt->close();
    } else {
        http_response_code(400);
        echo json_encode(['message' => 'Aksi tidak valid.']);
    }
} else {
    http_response_code(405);
    echo json_encode(['message' => 'Metode tidak diizinkan.']);
}

$conn->close();
?>