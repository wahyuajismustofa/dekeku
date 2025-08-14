// ========== Import ==========
import { hideLoader, initConfig, gtag } from "./core/dekeku.js";
import { loadAllData } from "./data/fetch.js";
import { bindDataAttributes, observerDataAttributes } from "./dom/dataBinding.js";
import { isNonEmptyArray, getEnvironment } from "./utils/dekeku.js";
import { defineOrIncrement, waitForCondition, getJsonFromSession, saveJsonToSession } from "./utils/utils.js";

// ========== Global Context ==========
if (!window._dekeku) window._dekeku = {};
const _dekeku = window._dekeku;
export default _dekeku;
// ========== Inisialisasi ==========
async function initDekeku() {
  const cachedDekeku = getJsonFromSession("_dekeku");

  if (cachedDekeku) {
    Object.assign(_dekeku, cachedDekeku);
  }else{
    _dekeku.repo = await initConfig();
    const { isDev, urlApi } = getEnvironment();
    _dekeku.devMode = isDev;
    _dekeku.urlApi = urlApi;
  }
  console.log(_dekeku.devMode ? "Huff.. 🛠️" : "Yatta!..🚀");
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
  defineOrIncrement(_dekeku, "prosesJs", 1);
  gtag(_dekeku.repo.googleAnalitik);
  bindDataAttributes();
  observerDataAttributes();
  _dekeku.ready = true;
  _dekeku.prosesJs -= 1;
  selesai();
});
