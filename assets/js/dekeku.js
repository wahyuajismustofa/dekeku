// ========== Import ==========
import { hideLoader, initConfig, gtag } from "./core/dekeku.js";
import { setupAccessPage, checkAccess, loadUserSession } from "./user/dekeku.js";
import { loadAllData } from "./data/fetch.js";
import { bindDataAttributes, observerDataAttributes } from "./dom/dataBinding.js";
import { isNonEmptyArray, getEnvironment } from "./utils/dekeku.js";


// ========== Global Context ==========
if (!window._dekeku) window._dekeku = {};
const _dekeku = window._dekeku;
export default _dekeku;

// ========== Setup User & Access ==========

_dekeku.user = loadUserSession();
// ========== Environment ==========
const { isDev, urlApi } = getEnvironment();
_dekeku.devMode = isDev;
_dekeku.urlApi = urlApi;
console.log(isDev ? "Huff.. 🛠️" : "Yatta!..🚀");

// ========== Inisialisasi ==========
async function initDekeku() {
  setupAccessPage();
  _dekeku.repo = await initConfig();
  gtag(_dekeku.repo.googleAnalitik);
  if (_dekeku.accessPage) {checkAccess(_dekeku.accessPage);}
  if (isNonEmptyArray(window._daftarJson)) {
    _dekeku.daftarJson = window._daftarJson;
    delete window._daftarJson;
    await loadAllData(_dekeku);
  }
}


// ========== Event ==========
document.addEventListener('DOMContentLoaded', async () => {
  await initDekeku();
  bindDataAttributes();
  observerDataAttributes();
  _dekeku.ready = true;
  hideLoader();
});