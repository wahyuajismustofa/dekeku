// ========== Import ==========
import { hideLoader, initConfig, gtag } from "./core/dekeku.js";
import { setupAccessPage, checkAccess, loadUserSession } from "./user/dekeku.js";
import { loadAllData } from "./data/fetch.js";
import { bindDataAttributes, observerDataAttributes } from "./dom/dataBinding.js";
import { isNonEmptyArray, getEnvironment } from "./utils/dekeku.js";
import { defineOrIncrement, waitForCondition, getJsonFromSession, saveJsonToSession } from "./utils/utils.js";

// ========== Global Context ==========
if (!window._dekeku) window._dekeku = {};
const _dekeku = window._dekeku;
export default _dekeku;

// Hitung proses JavaScript
defineOrIncrement(_dekeku, "prosesJs", 1);

// ========== Setup User & Access ==========
_dekeku.user = loadUserSession();

// ========== Environment ==========
const { isDev, urlApi } = getEnvironment();
_dekeku.devMode = isDev;
_dekeku.urlApi = urlApi;

console.log(isDev ? "Huff.. 🛠️" : "Yatta!..🚀");

// ========== Inisialisasi ==========
async function initDekeku() {
  const cachedDekeku = getJsonFromSession("_dekeku");

  if (cachedDekeku) {
    console.log("♻️ Memuat _dekeku dari sessionStorage...");
    Object.assign(_dekeku, cachedDekeku);
    return;
  }

  console.log("🔄 Memuat _dekeku baru dari server...");

  _dekeku.repo = await initConfig();
  if (isNonEmptyArray(window._daftarJson)) {
    _dekeku.daftarJson = window._daftarJson;
    delete window._daftarJson;
    await loadAllData(_dekeku);
  }
  saveJsonToSession("_dekeku", _dekeku);
}

// ========== Selesai ==========
function selesai() {
  waitForCondition(
    () => _dekeku.prosesJs === 0,
    () => hideLoader(),
    {
      interval: 100,
      timeout: 5000,
      onTimeout: () => {
        _dekeku.prosesJs = 0;
        console.warn("⏰ hideLoader() dijalankan paksa karena proses terlalu lama.");
        hideLoader();
      }
    }
  );
}

// ========== Event ==========
document.addEventListener("DOMContentLoaded", async () => {
  await initDekeku();
  setupAccessPage();
  gtag(_dekeku.repo.googleAnalitik);

  if (_dekeku.accessPage) {
    checkAccess(_dekeku.accessPage);
  }

  bindDataAttributes();
  observerDataAttributes();
  _dekeku.ready = true;
  _dekeku.prosesJs -= 1;
  selesai();
});
