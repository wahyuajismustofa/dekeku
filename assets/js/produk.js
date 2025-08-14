import { waitForCondition } from "./utils/utils.js";
import { enrichWithLookups, filterData } from "./utils/jsonHandler.js";
import { writeURLParams, readURLParams } from "./utils/urlParams.js";
import { wrapElement, getUniqueId } from "./dom/utils.js";
import { showBuyModal } from "./dom/modal.js";
// ================== DATA PRODUK ==================
const _dekeku = window._dekeku;
window._daftarJson = window._daftarJson || [];
const file = {file:"produk", nama: "produk"};
const file2 = {file:"data.seller",filter: { id:1 }, obj:true , nama: "seller"};
if (!window._daftarJson.includes(file)) {
  window._daftarJson.push(file);
  window._daftarJson.push(file2);
}
waitForCondition(
  () => typeof _dekeku !== "undefined" && _dekeku.ready === true,
  () => {
    renderProdukdanFilter();
  },
  {
    timeout: 5000,
    onTimeout: () => console.error("Gagal menunggu _dekeku.ready"),
  }
);

let {
  dataProduk = [],
  dataKategori = [],
  dataPaket = [],
  dataProdukShow = {},
  filters = {}
} = {};

const keyFilterProduk = ['kategori','acara','tema'];
let PRODUK_PER_HALAMAN = 10;


async function renderProdukdanFilter(){
  await getDataProduk();
  filters = readURLParams();
  updateDataProdukShow();
  renderFilters(dataProduk, keyFilterProduk);
  renderProduk(dataProdukShow);
}

async function getDataProduk() {
  dataProduk = _dekeku.dataJson[file.nama].produk;
  dataKategori = _dekeku.dataJson[file.nama].kategori;
  dataPaket = _dekeku.dataJson[file.nama].paket;
  dataProduk = enrichWithLookups(dataProduk, { kategori: dataKategori, paket: dataPaket });
}

function updateDataProdukShow() {
  dataProdukShow = filterData(dataProduk, filters);
}


function renderFilters(data, keys) {
  const container = document.querySelector(`[data-element="filter-produk"]`);
  if (!container){
    return;
  }
  const filterId = getUniqueId("filter-produk"); 
  container.id = filterId;

  if (!container.closest('.card')) {
    const wraper1 = document.createElement("div");
    wraper1.className = "card-body shadow-soft border border-light rounded p-1";
    const wraper2 = document.createElement("div");
    wraper2.className = "card bg-primary shadow-inset border-light p-2 mb-4";

    wrapElement(container, wraper1);
    wrapElement(wraper1, wraper2);
  }

  container.innerHTML = "";

  let filteredData = data;

  keys.forEach((key, index) => {
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
      renderFilters(data, keys);
    });

    div.appendChild(labelEl);
    div.appendChild(selectEl);
    container.appendChild(div);
  });
  setupFilterListeners();
}

function setupFilterListeners() {
  const wrapper = document.querySelector(`[data-element="filter-produk"]`);
  if (!wrapper) return;

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
      renderProduk(dataProdukShow);
    });
  });
}


// ================== RENDER PRODUK ==================
function renderProduk(data) {
  const container = document.querySelector(`[data-element="daftar-produk"]`);
  if (!container) return;

  const produkId = getUniqueId("daftar-produk");
  container.id = produkId;
  container.innerHTML = "";
  
  const existingBtn = document.getElementById(`${produkId}-load-more`);
  if (existingBtn) existingBtn.remove();
  
  loadMoreProduk({ data, container, produkId });
}

function loadMoreProduk({ data, container, produkId }) {
  let currentIndex = 0;

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
              <button class="btn btn-icon-only btn-buy" data-tema-id='${tema.id}'>
                <span class="fas fa-shopping-cart"></span>
              </button>
              <a class="btn btn-icon-only" href="${tema.link_produk}" target=_blank data-placement="bottom" data-toggle="tooltip" title="Lihat">
                <span class="fas fa-eye"></span>
              </a>
            </div>
          </div>
        </div>`;

      container.appendChild(card);
    });

    currentIndex += PRODUK_PER_HALAMAN;

    if (currentIndex < data.length) {
      showLoadMoreButton();
    } else {
      const btnWrapper = document.getElementById(`${produkId}-load-more-wrapper`);
      const btn = document.getElementById(`${produkId}-load-more`);
      if (btnWrapper) btnWrapper.remove();
      if (btn) btn.disabled = true;
    }
  }

  function showLoadMoreButton() {
    let wrapperId = `${produkId}-load-more-wrapper`;
    let btnId = `${produkId}-load-more`;

    let btnWrapper = document.getElementById(wrapperId);
    if (!btnWrapper) {
      btnWrapper = document.createElement("div");
      btnWrapper.id = wrapperId;
      btnWrapper.className = "d-flex justify-content-center";
      container.parentElement.appendChild(btnWrapper);
    }

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
  document.body.addEventListener('click', function (e) {
    const btn = e.target.closest('.btn-buy');
    if (!btn) return;

    const id = btn.dataset.temaId;
    const tema = data.find(p => p.id == id);
    if (!tema) {
      showAlert('Produk tidak ditemukan.', 'error');
      return;
    }

    showBuyModal(tema);
  });
  
  loadMore();
}