// js/script.js

// HOST API
const API_URL = 'http://localhost/ami-green-farm/api/';

// =================================================================
// 1. FUNGSI REGISTRASI
// =================================================================
if (document.getElementById('formRegistrasi')) {
    document.getElementById('formRegistrasi').addEventListener('submit', async function(event) {
        event.preventDefault();
        
        const nama = document.getElementById('regNama').value;
        const email = document.getElementById('regEmail').value;
        const password = document.getElementById('regPassword').value;
        const role = document.getElementById('regRole').value;
        const messageDiv = document.getElementById('regMessage');

        messageDiv.classList.add('d-none'); // Sembunyikan pesan lama

        // Struktur Percabangan IF: Validasi Sederhana
        if (password.length < 6) {
            messageDiv.textContent = 'Password harus minimal 6 karakter.';
            messageDiv.classList.remove('alert-success', 'alert-danger');
            messageDiv.classList.add('alert-warning', 'd-block');
            return; // Hentikan proses jika validasi gagal
        }

        try {
            const response = await fetch(API_URL + 'users.php?action=register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ nama, email, password, role })
            });

            const data = await response.json();

            if (response.ok) {
                messageDiv.textContent = data.message;
                messageDiv.classList.remove('alert-warning', 'alert-danger');
                messageDiv.classList.add('alert-success', 'd-block');
                this.reset(); // Kosongkan formulir setelah berhasil
                // Arahkan ke Login setelah sukses (opsional)
                // setTimeout(() => { window.location.href = 'login.html'; }, 2000);
            } else {
                messageDiv.textContent = `Registrasi Gagal: ${data.message || 'Terjadi kesalahan server.'}`;
                messageDiv.classList.remove('alert-success', 'alert-warning');
                messageDiv.classList.add('alert-danger', 'd-block');
            }
        } catch (error) {
            messageDiv.textContent = 'Gagal terhubung ke API.';
            messageDiv.classList.remove('alert-success', 'alert-warning');
            messageDiv.classList.add('alert-danger', 'd-block');
            console.error('Error:', error);
        }
    });
}


// =================================================================
// 2. FUNGSI LOGIN DENGAN VALIDASI JS
// =================================================================
if (document.getElementById('formLogin')) {
    document.getElementById('formLogin').addEventListener('submit', async function(event) {
        event.preventDefault();
        
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        const messageDiv = document.getElementById('loginMessage');

        messageDiv.classList.add('d-none'); // Sembunyikan pesan lama

        try {
            const response = await fetch(API_URL + 'users.php?action=login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            // Struktur Percabangan IF: Validasi Login dari Respons API
            if (response.ok) {
                // Login BERHASIL
                const user = data.user;
                
                // Simpan data user ke Session Storage (untuk membedakan public/member)
                sessionStorage.setItem('isLoggedIn', 'true');
                sessionStorage.setItem('userRole', user.role);
                sessionStorage.setItem('userName', user.nama);
                
                // Pindah Halaman setelah Login
                if (user.role === 'member') {
                    // Pindah ke Halaman Menu Utama (Dashboard)
                    window.location.href = 'dashboard.html';
                } else if (user.role === 'public') {
                    // Pindah ke Halaman Home, atau berikan pesan bahwa harus upgrade
                    window.location.href = 'index.html'; // Contoh: Arahkan ke Home jika role public
                }
                
            } else {
                // Login GAGAL
                messageDiv.textContent = `Login Gagal: ${data.message || 'Email atau Password salah.'}`;
                messageDiv.classList.remove('alert-success');
                messageDiv.classList.add('alert-danger', 'd-block');
            }
        } catch (error) {
            messageDiv.textContent = 'Gagal terhubung ke API atau server. Pastikan XAMPP berjalan.';
            messageDiv.classList.remove('alert-success');
            messageDiv.classList.add('alert-danger', 'd-block');
            console.error('Error:', error);
        }
    });
}

// =================================================================
// 3. FUNGSI CHECK AUTHENTIKASI UNTUK DASHBOARD/HALAMAN PREMIUM
// =================================================================
function checkAuthDashboard() {
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    const userRole = sessionStorage.getItem('userRole');

    // Struktur Percabangan IF untuk memeriksa Role
    if (isLoggedIn !== 'true' || userRole !== 'member') {
        alert('Akses ditolak! Anda harus login sebagai MEMBER untuk mengakses halaman ini.');
        window.location.href = 'login.html'; // Arahkan kembali ke halaman login
    } else {
        // Tampilkan nama user di dashboard
        const userName = sessionStorage.getItem('userName');
        if(document.getElementById('userNameDisplay')) {
            document.getElementById('userNameDisplay').textContent = userName;
        }
    }
}

// =================================================================
// 4. FUNGSI LOGOUT
// =================================================================
function logout() {
    sessionStorage.removeItem('isLoggedIn');
    sessionStorage.removeItem('userRole');
    sessionStorage.removeItem('userName');
    alert('Anda telah Logout.');
    window.location.href = 'index.html';
}

// Panggil fungsi checkAuth saat halaman dashboard dimuat
document.addEventListener('DOMContentLoaded', function() {
    if (document.body.id === 'dashboardPage') {
        checkAuthDashboard();
    }
});
// js/script.js (lanjutan dari Tahap 3)

// ... (Fungsi-fungsi Registrasi, Login, Auth, Logout di atas) ...

// =================================================================
// 5. FUNGSI MENAMPILKAN DETAIL
// =================================================================
function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

document.addEventListener('DOMContentLoaded', function() {
    if (document.body.id === 'detailPage') {
        const productId = getQueryParam('product_id');
        const infoType = getQueryParam('info');

        if (productId) {
            fetchProductDetail(productId);
        } else if (infoType) {
            displayInfoDetail(infoType);
        } else {
            document.getElementById('detailContent').innerHTML = '<div class="alert alert-warning">Parameter detail tidak ditemukan.</div>';
        }
    }

async function fetchProductDetail(id) {
    try {
        const response = await fetch(API_URL + 'products.php?id=' + id);
        const product = await response.json();
        const contentDiv = document.getElementById('detailContent');

        if (response.ok) {
            contentDiv.innerHTML = `
                <div class="row align-items-start">
                    <div class="col-md-6">
                        <img src="img/${product.gambar_url || 'default.jpg'}" class="img-fluid rounded-3 shadow-sm mb-4" alt="${product.nama_produk}">
                    </div>
                    <div class="col-md-6">
                        <span class="badge bg-primary-green mb-3 fs-6">${product.kategori} | Metode Tanam: ${product.kategori.includes('Organik') ? 'Organik' : 'Hidroponik'}</span>
                        <h1 class="display-5 text-dark-green">${product.nama_produk}</h1>
                        <p class="lead fw-bold text-danger">Harga: Rp ${parseFloat(product.harga).toLocaleString('id-ID')}</p>
                        <hr>
                        
                        <div class="mb-4">
                            <h4 class="text-secondary-green">Deskripsi</h4>
                            <p>${product.deskripsi}</p>
                        </div>

                        <div class="mb-4">
                            <h4 class="text-secondary-green">Kandungan Gizi</h4>
                            <p>${product.kandungan_gizi}</p>
                        </div>

                        <div class="mb-4">
                            <h4 class="text-secondary-green">Cara Penyimpanan</h4>
                            <p>${product.cara_simpan}</p>
                        </div>

                        <button class="btn btn-farm btn-lg w-100 mt-3">Tambahkan ke Keranjang (Dummy)</button>
                    </div>
                </div>
            `;
        } else {
            contentDiv.innerHTML = `<div class="alert alert-danger">${product.message || 'Produk tidak ditemukan.'}</div>`;
        }
    } catch (error) {
        console.error('Error fetching product detail:', error);
        document.getElementById('detailContent').innerHTML = '<div class="alert alert-danger">Gagal memuat detail produk.</div>';
    }
}

function displayInfoDetail(infoType) {
    const contentDiv = document.getElementById('detailContent');
    let title = '';
    let content = '';

    // Data Dummy untuk Halaman Detail Informasi (Berdasarkan 4 Kartu di Home)
    // Struktur Percabangan IF untuk menampilkan konten detail
    if (infoType === 'organik') {
        title = 'Cara Menanam Organik Tanpa Pestisida';
        content = `
            <p>Menanam secara organik berarti menumbuhkan tanaman di lingkungan alami tanpa menggunakan pupuk atau pestisida sintetis. Proses ini berfokus pada kesehatan tanah dan ekosistem.</p>
            <h4 class="text-secondary-green">Langkah Dasar:</h4>
            <ul>
                <li>Persiapan Tanah: Gunakan kompos dan pupuk kandang alami untuk memperkaya tanah.</li>
                <li>Pengendalian Hama: Terapkan pengendalian hama terpadu (PHT) menggunakan predator alami, atau semprotan air sabun.</li>
                <li>Rotasi Tanaman: Ganti jenis tanaman yang ditanam pada lahan yang sama secara berkala untuk menjaga nutrisi tanah.</li>
            </ul>
            
        `;
    } else if (infoType === 'hidroponik') {
        title = 'Tips dan Manfaat Teknik Hidroponik';
        content = `
            <p>Hidroponik adalah metode menanam tanpa tanah, di mana nutrisi diserap tanaman dari larutan air bernutrisi. Metode ini sangat efisien dalam penggunaan air.</p>
            <h4 class="text-secondary-green">Teknik Dasar:</h4>
            <ul>
                <li>Sistem NFT (Nutrient Film Technique):** Air mengalir tipis di bawah akar tanaman.</li>
                <li>Sistem DFT (Deep Flow Technique):** Akar terendam dalam larutan nutrisi yang dalam.</li>
                <li>Manfaat: Pertumbuhan lebih cepat, penggunaan air 90% lebih sedikit, dan hasil panen lebih bersih.</li>
            </ul>
            
        `;
    } else if (infoType === 'edukasi') {
        title = 'Program Edukasi & Workshop Ami Green Farm';
        content = `
            <p>Kami rutin mengadakan workshop bulanan untuk siapa saja yang tertarik dengan pertanian urban.</p>
            <h4 class="text-secondary-green">Workshop Terbaru:</h4>
            <ul>
                <li>Judul: Langkah Awal Menanam Selada Hidroponik di Pekarangan Rumah.</li>
                <li>Jadwal: Setiap Sabtu pertama bulan depan.</li>
                <li>Materi: Persiapan nutrisi, penanaman semai, dan troubleshooting umum.</li>
            </ul>
            <p class="fw-bold">Segera daftar tempat terbatas! Biaya: Rp 150.000 (Termasuk benih dan modul).</p>
        `;
    } else if (infoType === 'produk') {
        title = 'Kualitas dan Kesegaran Produk Sayuran';
        content = `
            <p>Semua produk di Ami Green Farm dipanen pada puncak kesegaran dan dikemas secara higienis. Kami menjamin produk bebas pestisida dan kaya nutrisi.</p>
            <p class="fw-bold">Kunjungi halaman <a href="katalog.html">Katalog Lengkap</a> kami untuk melihat detail harga dan varietas.</p>
        `;
    } else {
        title = 'Informasi Tidak Ditemukan';
        content = '<div class="alert alert-warning">Informasi yang Anda cari tidak tersedia.</div>';
    }

    // Tampilkan hasil
    contentDiv.innerHTML = `
        <h1 class="text-dark-green mb-4">${title}</h1>
        <hr>
        <div class="detail-article">
            ${content}
        </div>
        <a href="index.html" class="btn btn-outline-secondary mt-5">← Kembali ke Halaman Utama</a>
    `;
}
});
// =================================================================
// 6. FUNGSI AMBIL DAN TAMPILKAN PRODUK (Katalog)
// =================================================================
async function fetchAndDisplayProducts() {
    const productGrid = document.getElementById('productGrid');
    if (!productGrid) return; // Keluar jika bukan halaman katalog

    try {
        const response = await fetch(API_URL + 'products.php');
        const products = await response.json();
        
        // Bersihkan grid sebelum mengisi data
        productGrid.innerHTML = ''; 

        if (response.ok && products.length > 0) {
            products.forEach(product => {
                const isHidroponik = product.kategori.includes('Hidroponik');
                const badgeColor = isHidroponik ? 'bg-secondary-green' : 'bg-primary-green';
                const kategoriTanam = isHidroponik ? 'Hidroponik' : 'Organik';

                const productHtml = `
                    <div class="col product-item" 
                         data-kategori="${product.kategori}" 
                         data-metode="${kategoriTanam}">
                        <div class="card card-farm h-100">
                            <img src="img/${product.gambar_url || 'default.jpg'}" 
                                 class="card-img-top" 
                                 alt="${product.nama_produk}" 
                                 style="height: 200px; object-fit: cover;">
                            <div class="card-body">
                                <span class="badge ${badgeColor} mb-2">${kategoriTanam}</span>
                                <h5 class="card-title text-dark-green">${product.nama_produk}</h5>
                                <p class="card-text fw-bold">Rp ${parseFloat(product.harga).toLocaleString('id-ID')}</p>
                                <p class="card-text"><small class="text-muted">${product.deskripsi.substring(0, 50)}...</small></p>
                                <a href="detail.html?product_id=${product.id}" class="btn btn-sm btn-outline-farm w-100">Lihat Detail</a>
                                <button class="btn btn-sm btn-farm w-100 mt-2">Beli (Dummy)</button>
                            </div>
                        </div>
                    </div>
                `;
                productGrid.innerHTML += productHtml;
            });
        } else {
            productGrid.innerHTML = '<div class="col-12"><div class="alert alert-info">Belum ada produk yang terdaftar.</div></div>';
        }
    } catch (error) {
        console.error('Error fetching products:', error);
        productGrid.innerHTML = '<div class="col-12"><div class="alert alert-danger">Gagal memuat katalog. Pastikan API berjalan.</div></div>';
    }
}

// =================================================================
// 7. FUNGSI FILTER PRODUK (Dummy/Frontend Saja)
// =================================================================
function applyFilters() {
    // Implementasi filter sederhana (hanya frontend)
    const items = document.querySelectorAll('.product-item');
    const categories = Array.from(document.querySelectorAll('#filterForm input[type="checkbox"]:checked')).map(cb => cb.value);

    items.forEach(item => {
        const itemKategori = item.getAttribute('data-kategori');
        const itemMetode = item.getAttribute('data-metode');
        
        // Filter akan berlaku jika salah satu kriteria terpenuhi
        const isVisible = categories.includes(itemKategori) || categories.includes(itemMetode);
        
        // Struktur Percabangan IF: Menampilkan atau menyembunyikan item
        if (isVisible) {
            item.style.display = 'block';
        } else {
            item.style.display = 'none';
        }
    });
}

// Event Listener Utama
document.addEventListener('DOMContentLoaded', function() {
    // ... (checkAuthDashboard di sini) ...
    if (document.body.id === 'dashboardPage') {
        checkAuthDashboard();
    }
    
    // Panggil fungsi display product saat halaman katalog dimuat
    if (document.title.includes('Katalog Produk')) {
        fetchAndDisplayProducts();
        
        // Tambahkan event listener untuk tombol filter
        const filterButton = document.querySelector('#filterForm button');
        if (filterButton) {
             // Menggunakan Event Listener pada tombol filter dummy
            filterButton.addEventListener('click', applyFilters);
        }
    }
    // ... (Logika detail di sini) ...
    if (document.body.id === 'detailPage') {
        const productId = getQueryParam('product_id');
        const infoType = getQueryParam('info');

        if (productId) {
            fetchProductDetail(productId);
        } else if (infoType) {
            displayInfoDetail(infoType);
        } else {
            document.getElementById('detailContent').innerHTML = '<div class="alert alert-warning">Parameter detail tidak ditemukan.</div>';
        }
    }
});