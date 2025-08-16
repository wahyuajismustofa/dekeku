// assets/js/dekeku.js
// Last Update 17/08/2025 06:54 WIB
// ========== Import ==========
import { hideLoader, initConfig, gtag } from "./core/dekeku.js";
import { loadAllData, setDataJson } from "./data/fetch.js";
import { bindDataAttributes, observerDataAttributes } from "./dom/dataBinding.js";
import { getEnvironment } from "./utils/dekeku.js";
import { showAlert,defineOrIncrement, waitForCondition, getDekekuFromSession, saveDekekuToSession, pushUniqueObj } from "./utils/utils.js";
import { writeURLParams, readURLParams } from "./utils/urlParams.js";

// ========== Global Context ==========
if (!window._dekeku) window._dekeku = {};
const _dekeku = window._dekeku;
export default _dekeku;

export const dekekuFunction = {
  waitForCondition,
  loadAllData,
  saveDekeku: saveDekekuToSession,
  pushUniqueObj,
  writeURLParams,
  readURLParams,
  setDataJson,
  showAlert
};

// ========== Inisialisasi ==========
async function initDekeku() {
  const cachedDekeku = getDekekuFromSession();

  if (cachedDekeku) {
    Object.assign(_dekeku, cachedDekeku);
  } else {
    _dekeku.repo = await initConfig();
    const { isDev, urlApi } = getEnvironment();
    _dekeku.devMode = isDev;
    _dekeku.urlApi = urlApi;
  }
    
  for (const [key, fn] of Object.entries(dekekuFunction)) {
    if (typeof fn === "function") {
      _dekeku.function ??= {};
      _dekeku.function[key] = fn;
    }
  }
  console.log(_dekeku.devMode ? "Huff.. 🛠️" : "Yatta!..🚀");
  _dekeku.daftarJson = _dekeku.daftarJson || [];

  saveDekekuToSession();
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
        console.warn("hideLoader() dijalankan paksa karena proses terlalu lama.");
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