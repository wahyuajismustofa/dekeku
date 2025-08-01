// assets/js/produk.js
// Oleh             : Wahyu Ajis Mustofa
// Update Terakhir  : Selasa, 22 Juli 2025


// ===================================================================
// IMPORT MODUL
// ===================================================================

// ===================================================================
// DEV Option
// ===================================================================
function isLocalhost() {
  const host = window.location.hostname;
  return (
    host === "localhost" ||
    host === "127.0.0.1" ||
    host === "::1" ||
    // untuk alamat IP lokal (misal 192.168.x.x atau 10.x.x.x)
    /^192\.168\.\d{1,3}\.\d{1,3}$/.test(host) ||
    /^10\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(host)
  );
}
let devMode = isLocalhost();

// ===================================================================
// PRODUK HANDLER
// ===================================================================

// ================== DATA PRODUK ==================
let dataProduk = [];
let dataProdukShow = {};
let dataProdukUpdate = {};
let filters = {};
let urlProduk = '';

if (devMode){
  urlProduk = "/assets/data/produkDev.json";
}else{
  urlProduk = "/assets/data/produk.json";
}
const idProdukContainer = 'daftar-produk';
const idFilterContainer = 'filter-produk';
const keyFilterProduk = ['kategori','acara','tema']; // contoh : ['nama','kategori']
let PRODUK_PER_HALAMAN = 10;

async function initProduk() {
  await getDataProduk();
}
async function renderProdukdanFilter(){
  await getDataProduk();
  filters = readURLParams();
  updateDataProdukShow();
  renderFilters(dataProduk, idFilterContainer, keyFilterProduk);
  renderProduk(dataProdukShow, idProdukContainer);
}

async function getDataProduk() {
  data = await fetchJsonData(urlProduk);
  dataProduk = data.produk || [];
  dataKategori = data.kategori || [];
  dataPaket = data.paket || [];

  dataProduk = json_StringToArray(dataProduk,'paket');
  dataProduk = enrichProduk(dataProduk,dataKategori,dataPaket);
  dataProdukUpdate.nama = "produk";
  dataProdukUpdate.updated = data.updated;
  window.dataProdukUpdate = dataProdukUpdate;
  delete data.updated;
}

function updateDataProdukShow() {
  dataProdukShow = filterData(dataProduk, filters);
}

async function fetchJsonData(url) {
  try {
    const timestamp = Date.now();
    const connector = url.includes('?') ? '&' : '?';
    const fullUrl = `${url}${connector}t=${timestamp}`;

    const response = await fetch(fullUrl);
    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Gagal membaca file JSON:", error);
    return null;
  }
}

function json_StringToArray(data, key) {
  return data.map(p => {
    let value = p[key];

    if (typeof value === 'string') {
      value = value
        .split(',')
        .map(s => parseInt(s.trim(), 10))
        .filter(Number.isInteger);
    }

    if (typeof value === 'number') {
      value = [value];
    }

    return {
      ...p,
      [key]: value
    };
  });
}

const enrichProduk = (produkList, kategoriList, paketList) =>
  produkList.map(p => {
    const { produk = '', tema = '', acara = '' } =
      kategoriList.find(k => k.id === p.kategori) || {};
    const paket = (p.paket || []).map(id =>
      (({ nama, harga }) => ({ nama, harga }))(paketList.find(pk => pk.id === id) || {})
    );
    return { id: p.id, nama: p.nama, img: p.img, link_produk: p.link_produk, kategori: produk, tema, acara, paket };
  });


function filterData(data, filters) {
  return data.filter(item => {
    return Object.entries(filters).every(([key, value]) => {
      if (typeof value === 'string') {
        return item[key]?.toLowerCase() === value.toLowerCase();
      }
      return item[key] === value;
    });
  });
}

function renderFilters(data, idFilterContainer, keys) {
  const container = document.getElementById(idFilterContainer);
  if (!container) return console.warn(`Element #${idFilterContainer} tidak ditemukan.`);

  container.innerHTML = "";

  let filteredData = data;

  keys.forEach((key, index) => {
    // Jika sebelumnya ada filter, gunakan untuk filter data
    if (index > 0) {
      const prevKey = keys[index - 1];
      const prevValue = filters[prevKey];
      if (prevValue) {
        filteredData = filteredData.filter(item => item[prevKey] === prevValue);
      }
    }

    // Lewati jika key tidak ada dalam data yang telah difilter
    if (!filteredData.some(item => key in item)) return;

    const id = `filter-${key}`;
    const label = key.charAt(0).toUpperCase() + key.slice(1).replaceAll('_', ' ');

    const uniqueValues = [...new Set(filteredData.map(item => item[key]).filter(Boolean))]
      .sort((a, b) => a.localeCompare(b, 'id', { sensitivity: 'base' }));
    if (uniqueValues.length === 0) return;

    const div = document.createElement('div');
    div.className = "form-group";

    const labelEl = document.createElement('label');
    labelEl.setAttribute('for', id);
    labelEl.textContent = label;

    const selectEl = document.createElement('select');
    selectEl.id = id;
    selectEl.name = key;
    selectEl.setAttribute('aria-label', label);
    selectEl.className = "form-control";

    const optAll = document.createElement('option');
    optAll.value = "";
    optAll.textContent = `-- Semua ${label} --`;
    selectEl.appendChild(optAll);

    uniqueValues.forEach(value => {
      const option = document.createElement('option');
      option.value = value;
      option.textContent = value;
      if (filters[key] === value) option.selected = true;
      selectEl.appendChild(option);
    });

    // Event listener untuk update filters dan render ulang
    selectEl.addEventListener('change', () => {
      filters[key] = selectEl.value;
      // Reset semua filter di bawahnya
      for (let i = index + 1; i < keys.length; i++) {
        delete filters[keys[i]];
      }
      renderFilters(data, idFilterContainer, keys);
    });

    div.appendChild(labelEl);
    div.appendChild(selectEl);
    container.appendChild(div);
  });
  setupFilterListeners(idFilterContainer);
}

function setupFilterListeners(idFilterContainer) {
  const wrapper = document.getElementById(idFilterContainer);
  if (!wrapper) return console.warn(`Elemen dengan id "${idFilterContainer}" tidak ditemukan.`);

  const selects = wrapper.querySelectorAll("select");

  selects.forEach(select => {
    select.addEventListener("change", function () {
      const key = select.name || select.id.replace(/^filter-/, '');
      const value = select.value;

      if (value === "") {
        delete filters[key];
      } else {
        filters[key] = value;
      }
      writeURLParams(filters);
      updateDataProdukShow();
      renderProduk(dataProdukShow, idProdukContainer);
    });
  });
}

function writeURLParams(obj) {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(obj)) {
    if (value !== "") {
      params.set(key, value);
    }
  }

  const newURL = `${window.location.pathname}?${params.toString()}`;
  history.replaceState(null, "", newURL);
}

function readURLParams() {
  const params = new URLSearchParams(window.location.search);
  const obj = {};

  for (const [key, value] of params.entries()) {
    obj[key] = value;
  }

  return obj;
}


// ================== RENDER PRODUK ==================

function renderProduk(data, containerId) {
  const container = document.getElementById(containerId);
  if (!container) {
    console.warn(`Elemen dengan id "${containerId}" tidak ditemukan.`);
    return;
  }
  
  let currentIndex = 0;
  // Hapus konten sebelumnya
  container.innerHTML = "";
  const existingBtn = document.getElementById(`${containerId}-load-more`);
  if (existingBtn) existingBtn.remove();

  // Fungsi untuk render sebagian data
  function loadMore() {
    const slice = data.slice(currentIndex, currentIndex + PRODUK_PER_HALAMAN);

    slice.forEach((tema) => {
      const card = document.createElement("div");
      card.className = "col-6 col-sm-6 col-lg-3 mb-3 p-2";

      card.innerHTML = `
            <div class="card bg-primary shadow-soft border-light overflow-hidden">
            <img src="${tema.img}" alt="${tema.nama}">
            <div class="card-footer border-top border-light p-4">
                <a href="${tema.link_produk}" class="p">${tema.nama}</a>
                <div class="d-flex justify-content-around align-items-center mt-3">
                <button class="btn btn-icon-only btn-buy" data-tema='${JSON.stringify(tema).replace(/'/g, "&apos;")}'">
                    <span class="fas fa-shopping-cart"></span>
                </button>
                <a class="btn btn-icon-only" href="${tema.link_produk}" target=_blank data-placement="bottom" data-toggle="tooltip" title="Lihat">
                    <span class="fas fa-eye"></span>
                </a>
                </div>
            </div>
            </div>
      `;

      container.appendChild(card);
      const btnBuy = card.querySelector('.btn-buy');
      btnBuy.addEventListener('click', function () {
        const dataTema = JSON.parse(this.dataset.tema.replace(/&apos;/g, "'"));
        openBuyModal(dataTema);
      });
    });

    currentIndex += PRODUK_PER_HALAMAN;

    // Tampilkan atau hapus tombol jika sudah habis
    if (currentIndex < data.length) {
      showLoadMoreButton();
    } else {
      const btnWrapper = document.getElementById(`${containerId}-load-more-wrapper`);
      const btn = document.getElementById(`${containerId}-load-more`);
      if (btnWrapper) btnWrapper.remove();
      if (btn) btn.disabled = true;
    }
  }

  // Fungsi buat tombol load more
function showLoadMoreButton() {
  let wrapperId = `${containerId}-load-more-wrapper`;
  let btnId = `${containerId}-load-more`;

  // Cek dan buat wrapper jika belum ada
  let btnWrapper = document.getElementById(wrapperId);
  if (!btnWrapper) {
    btnWrapper = document.createElement("div");
    btnWrapper.id = wrapperId;
    btnWrapper.className = "d-flex justify-content-center";
    container.parentElement.appendChild(btnWrapper);
  }

  // Cek dan buat tombol jika belum ada
  let btn = document.getElementById(btnId);
  if (!btn) {
    btn = document.createElement("button");
    btn.id = btnId;
    btn.className = "btn btn-pill btn-primary";
    btn.setAttribute('aria-label', 'Lihat Lebih Banyak');
    btn.textContent = "Lihat Lebih Banyak";
    btn.onclick = loadMore;

    btnWrapper.appendChild(btn);
  }
}


  // Pertama kali muat
  loadMore();
}

// ============================ Keranjang ===========================
function addToCart(item) {
  const cart = JSON.parse(localStorage.getItem('keranjang')) || [];

  // Cari item yang cocok berdasarkan ID dan paket
  const existingIndex = cart.findIndex(p => p.id === item.id && p.harga === item.harga);

  if (existingIndex !== -1) {
    cart[existingIndex].jumlah += item.jumlah || 1;
  } else {
    cart.push({ ...item, jumlah: item.jumlah || 1 });
  }

  localStorage.setItem('keranjang', JSON.stringify(cart));
  showAlert(`${item.nama} berhasil ditambahkan ke keranjang!`, 'success');
}

let produkDipilih = null;
function openBuyModal(produk) {
  produkDipilih = produk;
  const $modal = $('#buyModal');
  // Set judul modal
  $('#buyModalLabel').text(`Pilih Paket untuk ${produk.nama}`);

  // Isi konten body
  const $body = $('#buyModalBody');
  $body.empty();

  if (!Array.isArray(produk.paket) || produk.paket.length === 0) {
    $body.html(`
      <div class="alert alert-danger shadow-soft" role="alert">
        <span class="alert-inner--text">
          Tidak ada paket yang tersedia pada produk ini
        </span>
      </div>
    `);
  } else {
    const groupName = 'paket';
    $body.append(`<legend class="h6 mb-3">Pilihan Paket</legend>`);

    produk.paket.forEach((paket, i) => {
      const id = `paket-${i}`;
      $body.append(`
        <div class="form-check mb-2">
          <input class="form-check-input" type="radio" name="${groupName}" id="${id}" value="${paket.nama}" ${i === 0 ? 'checked' : ''}>
          <label class="form-check-label" for="${id}">
            ${paket.nama} - Rp${paket.harga.toLocaleString('id-ID')}
          </label>
        </div>
      `);
    });
  }

  $modal.modal('show');
}


function resetModal(modalEl, elementsToClear = []) {
  const $modal = $(modalEl);

  // Hapus listener lama untuk mencegah duplikasi
  $modal.off('hidden.bs.modal').on('hidden.bs.modal', function () {
    elementsToClear.forEach(selector => {
      $(selector).empty();
    });
  });

  // Hilangkan fokus & tutup modal
  document.activeElement.blur();
  $modal.modal('hide');
}


function submitBuyModal(e) {
  e.preventDefault();
  const paket = $('input[name="paket"]:checked').val();
  if (!paket) return showAlert("Pilih salah satu paket dulu, ya.", "error");

  const paketDipilih = produkDipilih.paket.find(p => p.nama === paket);
  produkDipilih.paket = paketDipilih.nama;
  produkDipilih.harga = paketDipilih.harga;

  addToCart(produkDipilih);
  updateCartBadge();
  // Bersihkan setelah modal tertutup
  resetModal('#buyModal',['#buyModalLabel','#buyModalBody']);
}