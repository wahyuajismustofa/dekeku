const waAdmin = "6285161517176";

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
// ============================== SET CONTENT ==========================
  function showLoader(){
    const loader = document.getElementById('loadingScreen');
    if (loader){
      loader.className = 'position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center';
      loader.style.backgroundColor = '#e6e7ee';
      loader.style.zIndex = '1050';
      loader.style.transition = 'opacity 0.3s ease';
      loader.innerHTML = '<div class="spinner-border" style="width: 4rem; height: 4rem; color: #44476A;" role="status">';
    }
  }

  function hideLoader() {
    const loader = document.getElementById('loadingScreen');
    if (loader) {
      loader.style.opacity = '0';
      setTimeout(() => {
        loader.innerHTML = '';
        loader.className = '';
        loader.style = '';        
      }, 500);
    }
  }
function setLinkWA() {
  const link = `https://wa.me/${waAdmin}`;
  document.querySelectorAll('[data-variabel="link-wa"]').forEach(el => {
    el.setAttribute('href', link);
    el.setAttribute('target', '_blank');
  });
}

// ============================== FORM =================================
function setupWhatsappForm(selector = 'form[data-aksi="whatsapp"]') {
  document.querySelectorAll(selector).forEach(form => {
    form.addEventListener('submit', e => {
      e.preventDefault();

      const keterangan = form.dataset.keterangan || '';
      const heading = keterangan ? `*${keterangan.toUpperCase()}*\n\n` : '';
      const fields = form.querySelectorAll('input[name], textarea[name], select[name]');
      let pesan = heading;

      fields.forEach(field => {
        const name = field.name;
        const label = name.replace(/[_-]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        const value = field.value.trim();
        if (value) {
          pesan += `${label}: ${value}\n`;
        }
      });

      const waURL = `https://wa.me/${waAdmin}?text=${encodeURIComponent(pesan)}`;
      window.open(waURL, '_blank');
    });
  });
}



// ====================== Keranjang =========================
function updateCartBadge(attempt = 1) {
  try {
    const rawData = localStorage.getItem('keranjang');
    if (!rawData) return;

    const keranjang = JSON.parse(rawData);
    const totalJumlah = keranjang.reduce((total, item) => total + (item.jumlah || 0), 0);

    const badge = document.getElementById('cartCount');

    if (badge) {
      badge.textContent = totalJumlah;
      badge.style.display = totalJumlah > 0 ? 'inline-block' : 'none';
    } else if (attempt <= 5) {
      // Retry dengan delay 1 detik
      setTimeout(() => updateCartBadge(attempt + 1), 1000);
    } else {
      console.warn('Gagal menemukan elemen badge setelah 5 percobaan.');
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
  showLoader();
  await includeElement();
  setLinkWA();
  setupWhatsappForm();
});

  window.addEventListener('load', () => {
    hideLoader();
    updateCartBadge();
  });