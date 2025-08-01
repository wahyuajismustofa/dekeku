// Include
async function loadComponentContent(selector, url) {
  const el = document.querySelector(selector);
  if (!el) return;
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Gagal memuat ${url}`);
    const html = await response.text();
    el.innerHTML = html;
  } catch (err) {
    console.error(err);
    el.innerHTML = "<p class='text-danger'>Gagal memuat konten</p>";
  }
}

function updateCartBadge() {
  try {
    const rawData = localStorage.getItem('keranjang');
    if (!rawData) return;

    const keranjang = JSON.parse(rawData);
    const totalJumlah = keranjang.reduce((total, item) => total + (item.jumlah || 0), 0);

    const badge = document.getElementById('cartCount');

    if (badge) {
      badge.textContent = totalJumlah;
      badge.style.display = totalJumlah > 0 ? 'inline-block' : 'none';
    }
  } catch (e) {
    console.warn('Gagal membaca keranjang:', e);
  }
}

async function includeElement() {
  await Promise.all([
    loadComponentContent("#header-global", "/component/header.html"),
    loadComponentContent("#footer-global", "/component/footer.html")
  ]);
}

document.addEventListener('DOMContentLoaded', async () => {
  await includeElement();
  updateCartBadge();
});