// js/resep.js

// Data Dummy Resep Sayuran
const resepData = [
    {
        id: 1,
        nama: "Tumis Selada Romaine Saus Tiram",
        deskripsi: "Resep cepat dan lezat, cocok untuk menu makan malam sehat.",
        kategori: ["Daun", "Cepat"],
        kesulitan: "Mudah",
        waktu: "15 Menit",
        gambar: "https://placehold.co/400x200/38761d/ffffff?text=Romaine+StirFry",
        bahan: ["1 ikat Selada Romaine", "2 siung Bawang Putih", "1 sdm Saus Tiram", "Minyak Wijen"],
        langkah: "1. Tumis bawang putih hingga harum. 2. Masukkan selada. 3. Tambahkan saus tiram dan minyak wijen. 4. Masak sebentar hingga layu. Sajikan."
    },
    {
        id: 2,
        nama: "Sup Tomat Cherry Creamy",
        deskripsi: "Sup hangat yang menyegarkan, menggunakan Tomat Cherry manis dari kebun.",
        kategori: ["Buah", "Kuah"],
        kesulitan: "Sedang",
        waktu: "30 Menit",
        gambar: "https://placehold.co/400x200/6aa84f/ffffff?text=Tomato+Soup",
        bahan: ["250g Tomat Cherry", "500ml Kaldu Sayur", "100ml Krim", "Garam & Merica"],
        langkah: "1. Rebus tomat hingga lunak. 2. Blender tomat dan kaldu. 3. Panaskan kembali, tambahkan krim, garam, dan merica. 4. Hidangkan selagi hangat."
    },
    {
        id: 3,
        nama: "Pecel Bayam Merah",
        deskripsi: "Hidangan tradisional dengan sentuhan Bayam Merah, kaya zat besi.",
        kategori: ["Daun", "Tradisional"],
        kesulitan: "Mudah",
        waktu: "20 Menit",
        gambar: "https://placehold.co/400x200/274e13/ffffff?text=Red+Spinach",
        bahan: ["1 ikat Bayam Merah", "100g Tauge", "Saus Kacang Instan", "Air Hangat"],
        langkah: "1. Rebus bayam dan tauge sebentar, tiriskan. 2. Campur saus kacang dengan air hangat. 3. Siram sayuran dengan saus kacang. Sajikan segera."
    },
    {
        id: 4,
        nama: "Salad Mentimun Ala Korea",
        deskripsi: "Salad mentimun renyah dengan bumbu pedas manis Korea.",
        kategori: ["Buah", "Dingin"],
        kesulitan: "Mudah",
        waktu: "10 Menit",
        gambar: "https://placehold.co/400x200/b6d7a8/333333?text=Cucumber+Salad",
        bahan: ["2 buah Mentimun", "1 sdm Cuka", "1 sdm Gochugaru", "Garam, Gula, Bawang Putih cincang"],
        langkah: "1. Iris mentimun tipis-tipis. 2. Campur semua bahan bumbu. 3. Aduk rata mentimun dengan bumbu. 4. Dinginkan 5 menit sebelum disajikan."
    }
];

// Elemen container resep
const resepGrid = document.getElementById('resepGrid');
const searchInput = document.getElementById('searchInput');
const filterForm = document.getElementById('filterForm');

/**
 * Fungsi untuk me-render satu kartu resep ke HTML
 * @param {Object} resep - Objek resep
 * @returns {string} HTML string untuk kartu resep
 */
function createRecipeCard(resep) {
    const tags = resep.kategori.map(tag => 
        `<span class="badge badge-green me-1">${tag}</span>`
    ).join('');

    return `
        <div class="col-12 col-sm-6 col-lg-4 col-xl-3 resep-item" 
             data-kategori="${resep.kategori.join(' ')}" 
             data-kesulitan="${resep.kesulitan}">
            <div class="card card-recipe h-100">
                <img src="${resep.gambar}" class="card-img-top" alt="${resep.nama}">
                <div class="card-body d-flex flex-column">
                    <div class="mb-2">
                        ${tags}
                        <span class="badge badge-complexity ms-1">${resep.kesulitan}</span>
                    </div>
                    <h5 class="card-title">${resep.nama}</h5>
                    <p class="card-text text-muted small">${resep.deskripsi}</p>
                    <div class="mt-auto">
                        <p class="mb-1 small">⏱️ Waktu: ${resep.waktu}</p>
                        <!-- Tombol untuk menampilkan detail (modal) -->
                        <button type="button" class="btn btn-sm btn-farm w-100 mt-2" data-bs-toggle="modal" data-bs-target="#recipeModal" data-id="${resep.id}">
                            Lihat Resep Lengkap
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

/**
 * Fungsi utama untuk menampilkan resep
 * @param {Array} recipes - Array resep yang akan ditampilkan
 */
function renderRecipes(recipes) {
    resepGrid.innerHTML = '';
    if (recipes.length === 0) {
        resepGrid.innerHTML = '<div class="col-12 text-center py-5"><h4 class="text-muted">😢 Tidak ada resep yang ditemukan.</h4><p>Coba ubah kriteria pencarian atau filter Anda.</p></div>';
        return;
    }
    recipes.forEach(resep => {
        resepGrid.innerHTML += createRecipeCard(resep);
    });
}

/**
 * Fungsi untuk memfilter dan mencari resep
 */
function filterRecipes() {
    const searchTerm = searchInput.value.toLowerCase();
    const checkedCategories = Array.from(filterForm.querySelectorAll('input[name="kategori"]:checked')).map(cb => cb.value.toLowerCase());
    const checkedDifficulty = Array.from(filterForm.querySelectorAll('input[name="kesulitan"]:checked')).map(cb => cb.value.toLowerCase());

    const filtered = resepData.filter(resep => {
        const nameMatch = resep.nama.toLowerCase().includes(searchTerm);
        const descMatch = resep.deskripsi.toLowerCase().includes(searchTerm);
        
        // Filter Kategori
        const categoryMatch = checkedCategories.length === 0 || resep.kategori.some(cat => checkedCategories.includes(cat.toLowerCase()));
        
        // Filter Kesulitan
        const difficultyMatch = checkedDifficulty.length === 0 || checkedDifficulty.includes(resep.kesulitan.toLowerCase());

        return (nameMatch || descMatch) && categoryMatch && difficultyMatch;
    });

    renderRecipes(filtered);
}

// Event Listeners
searchInput.addEventListener('input', filterRecipes);
filterForm.addEventListener('change', filterRecipes);


/**
 * Setup modal saat tombol 'Lihat Resep Lengkap' diklik
 */
document.addEventListener('DOMContentLoaded', () => {
    // Render semua resep saat halaman dimuat
    renderRecipes(resepData);

    const recipeModal = document.getElementById('recipeModal');
    recipeModal.addEventListener('show.bs.modal', event => {
        const button = event.relatedTarget;
        const recipeId = button.getAttribute('data-id');
        const resep = resepData.find(r => r.id == recipeId);

        if (resep) {
            document.getElementById('modalRecipeTitle').textContent = resep.nama;
            document.getElementById('modalRecipeImage').src = resep.gambar;
            document.getElementById('modalRecipeTime').textContent = resep.waktu;
            document.getElementById('modalRecipeDifficulty').textContent = resep.kesulitan;
            document.getElementById('modalRecipeDescription').textContent = resep.deskripsi;

            // Bahan-bahan
            const bahanList = resep.bahan.map(b => `<li>🥕 ${b}</li>`).join('');
            document.getElementById('modalRecipeIngredients').innerHTML = bahanList;

            // Langkah-langkah
            const langkahList = resep.langkah.split('. ').map((l, index) => {
                if (l) return `<li>${index + 1}. ${l.trim()}</li>`;
                return '';
            }).join('');
            document.getElementById('modalRecipeSteps').innerHTML = langkahList;
        }
    });
});