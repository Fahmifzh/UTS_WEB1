<?php
require_once "db.php";

$method = $_SERVER['REQUEST_METHOD'];
$input  = json_decode(file_get_contents("php://input"), true);

switch ($method) {

    // =====================================================
    // GET → Ambil semua atau berdasarkan ID
    // =====================================================
    case 'GET':
        if (isset($_GET['id'])) {
            $id = $_GET['id'];
            $result = $conn->query("SELECT * FROM products WHERE id = $id");
            echo json_encode($result->fetch_assoc());
        } else {
            $result = $conn->query("SELECT * FROM products ORDER BY id DESC");
            $data = [];
            while ($row = $result->fetch_assoc()) {
                $data[] = $row;
            }
            echo json_encode($data);
        }
        break;

    // =====================================================
    // POST → Create Produk Baru
    // =====================================================
    case 'POST':

        $nama_produk     = $_POST['nama_produk']     ?? $input['nama_produk']     ?? null;
        $deskripsi       = $_POST['deskripsi']       ?? $input['deskripsi']       ?? null;
        $harga           = $_POST['harga']           ?? $input['harga']           ?? null;
        $kandungan_gizi  = $_POST['kandungan_gizi']  ?? $input['kandungan_gizi']  ?? null;
        $cara_simpan     = $_POST['cara_simpan']     ?? $input['cara_simpan']     ?? null;
        $kategori        = $_POST['kategori']        ?? $input['kategori']        ?? null;
        $gambar_url      = $_POST['gambar_url']      ?? $input['gambar_url']      ?? null;

        if (!$nama_produk || !$harga) {
            http_response_code(400);
            echo json_encode(["message" => "nama_produk dan harga wajib diisi"]);
            exit;
        }

        $stmt = $conn->prepare("
            INSERT INTO products 
            (nama_produk, deskripsi, harga, kandungan_gizi, cara_simpan, kategori, gambar_url)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ");

        $stmt->bind_param("ssdssss",
            $nama_produk,
            $deskripsi,
            $harga,
            $kandungan_gizi,
            $cara_simpan,
            $kategori,
            $gambar_url
        );

        if ($stmt->execute()) {
            echo json_encode([
                "message" => "Produk berhasil ditambahkan",
                "id" => $conn->insert_id
            ]);
        } else {
            http_response_code(500);
            echo json_encode(["message" => "Gagal menambahkan produk"]);
        }

        break;

    // =====================================================
    // PUT → Update Produk
    // =====================================================
    case 'PUT':

        $id              = $input['id']              ?? null;
        $nama_produk     = $input['nama_produk']     ?? null;
        $deskripsi       = $input['deskripsi']       ?? null;
        $harga           = $input['harga']           ?? null;
        $kandungan_gizi  = $input['kandungan_gizi']  ?? null;
        $cara_simpan     = $input['cara_simpan']     ?? null;
        $kategori        = $input['kategori']        ?? null;
        $gambar_url      = $input['gambar_url']      ?? null;

        if (!$id) {
            http_response_code(400);
            echo json_encode(["message" => "id wajib diisi"]);
            exit;
        }

        $stmt = $conn->prepare("
            UPDATE products SET
                nama_produk = ?,
                deskripsi = ?,
                harga = ?,
                kandungan_gizi = ?,
                cara_simpan = ?,
                kategori = ?,
                gambar_url = ?
            WHERE id = ?
        ");

        $stmt->bind_param("ssdssssi",
            $nama_produk,
            $deskripsi,
            $harga,
            $kandungan_gizi,
            $cara_simpan,
            $kategori,
            $gambar_url,
            $id
        );

        if ($stmt->execute()) {
            echo json_encode(["message" => "Produk berhasil diupdate"]);
        } else {
            http_response_code(500);
            echo json_encode(["message" => "Gagal update data"]);
        }

        break;

    // =====================================================
    // DELETE → Hapus Produk
    // =====================================================
    case 'DELETE':

        $id = $input['id'] ?? null;

        if (!$id) {
            http_response_code(400);
            echo json_encode(["message" => "id wajib diisi"]);
            exit;
        }

        if ($conn->query("DELETE FROM products WHERE id = $id")) {
            echo json_encode(["message" => "Produk berhasil dihapus"]);
        } else {
            http_response_code(500);
            echo json_encode(["message" => "Gagal menghapus produk"]);
        }

        break;

    default:
        http_response_code(405);
        echo json_encode(["message" => "Method not allowed"]);
        break;
}

$conn->close();
?>
