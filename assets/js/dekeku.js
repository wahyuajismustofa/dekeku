// ============================= INIT START =============================
if (typeof window._dekeku === "undefined"){ window._dekeku={}}
_dekeku = window._dekeku;
_dekeku.user = JSON.parse(localStorage.getItem('user'));
_dekeku.accessPage = window._accessPage;
delete window._accessPage;
function isDevelopmentMode() {
  const devHostnames = ['localhost', '127.0.0.1','wise-hyena-absolutely.ngrok-free.app'];
  const isLocalhost = devHostnames.includes(window.location.hostname);
  return isLocalhost;
}
if (isDevelopmentMode()) {
  console.log("Huff.. 🛠️");
  _dekeku.urlApi = "http://127.0.0.1:8787";
} else {
  console.log("Yatta!..🚀");
  _dekeku.urlApi = "https://api.dekeku.my.id";
  gtag();
}

async function initDekeku() {
  showLoader();
  if (typeof _dekeku.accessPage !== 'undefined'){checkAccess(_dekeku.accessPage)}
  _dekeku.repo = await initConfig();
  bindDataAttributes();

  if (cekArray(window._daftarJson)){
  _dekeku.daftarJson = window._daftarJson;
  delete window._daftarJson;
  await loadAllData().catch(err => {
    console.error('Error loading data:', err);
    showAlert("Gagal memuat data", "error");
    });
  }

  const observer = new MutationObserver(mutations => {
    for (const mutation of mutations) {
      mutation.addedNodes.forEach(node => {
        if (node.nodeType === 1) {
          if (node.matches?.("[data-aksi], [data-variabel]")) {
            bindDataAttributes(node.parentElement || node);
          } else if (node.querySelectorAll) {
            bindDataAttributes(node);
          }
        }
      });
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });
}

async function initConfig (){
  const config = await fetch(`${location.origin}/config.json`);
  if (!config.ok) {
    console.error('Repository Belum dikonfigurasi');
    showAlert("Repository Belum dikonfigurasi Silahkan Hubungi Admin", "error");
    return;
  }
  const data = await config.json();
  return data.repository;
}
// ============================= INIT END =============================
function gtag(){
  if (document.querySelector('script[src*="googletagmanager.com/gtag/js"]')) return;
  var gtagScript = document.createElement('script');
  gtagScript.async = true;
  gtagScript.src = `https://www.googletagmanager.com/gtag/js?id=${_dekeku.repo.googleAnalitik}`;
  var inlineScript = document.createElement('script');
  inlineScript.text = `
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', '${_dekeku.repo.googleAnalitik}');
  `;
  var head = document.head || document.getElementsByTagName('head')[0];
  head.appendChild(gtagScript);
  head.appendChild(inlineScript);
}
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
async function loadAllData() {
  _dekeku.dataJson = {};
  for (const file of _dekeku.daftarJson) {
    try {
      const data = await fetchDataJson(file);
      _dekeku.dataJson[file] = data;
    } catch (err) {
      console.error(`Error memuat ${file}:`, err);
    }
  }
}
function waitForData(getDataFn, intervalMs = 100) {
  return new Promise((resolve) => {
    const interval = setInterval(() => {
      const data = getDataFn();
      if (data && Object.keys(data).length > 0) {
        clearInterval(interval);
        resolve(data);
      }
    }, intervalMs);
  });
}

async function commit(data) {
  const res = await fetch(`${_dekeku.urlApi}/commit`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ data })
  });
  const json = await res.json();
  if (res.ok) alert("Berhasil!");
  else alert("Gagal: " + json.message);
}

// ================== FUNGSI UTIL ==================
async function fetchDataJson(file) {
  const now = Date.now();
  const response = await fetch(`https://raw.githubusercontent.com/${_dekeku.repo.username}/${_dekeku.repo.repo}/refs/heads/main/assets/data/${file}.json?t=${now}`);
  if (!response.ok) throw new Error('Network response was not ok');
  return await response.json();
}
function cekArray(arr) {
  return Array.isArray(arr) && arr.length > 0;
}
async function importKeyAESGCM(secret) {
  const rawKey = new TextEncoder().encode(secret.padEnd(32, "_"));
  return await crypto.subtle.importKey(
    "raw",
    rawKey,
    { name: "AES-GCM" },
    false,
    ["encrypt", "decrypt"]
  );
}

async function encryptAESGCM(text, secret) {
  const key = await importKeyAESGCM(secret);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encodedText = new TextEncoder().encode(text);

  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    encodedText
  );

  const combined = new Uint8Array(iv.length + encrypted.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(encrypted), iv.length);

  return btoa(String.fromCharCode(...combined)); // Base64
}

async function decryptAESGCM(enText, secret) {
  const key = await importKeyAESGCM(secret);
  const encryptedBytes = Uint8Array.from(atob(enText), c => c.charCodeAt(0));
  const iv = encryptedBytes.slice(0, 12);
  const data = encryptedBytes.slice(12);

  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    key,
    data
  );

  return new TextDecoder().decode(decrypted);
}
// =========================== FORM ===========================
function removePrefix(fullPath, filename) {
  if (!fullPath.startsWith(filename)) return fullPath;
  const rest = fullPath.slice(filename.length);
  return rest.startsWith('.') ? rest.slice(1) : rest;
}
function getNestedValue(obj, path) {
  if (!path) return obj;
  return path.split('.').reduce((o, key) => (o && o[key] !== undefined ? o[key] : undefined), obj);
}
function insertWithAutoId(arr, dataBaru) {
  const maxId = arr.reduce((max, item) => Math.max(max, item.id || 0), 0);
  const dataDenganId = { id: maxId + 1, ...dataBaru };
  arr.push(dataDenganId);
  return arr;
}
async function handleGithubPostFormSubmit(form) {
  const fileKey = form.dataset.file;
  if (!fileKey) return showAlert("Data-file tidak ditemukan", "error");

  const parts = fileKey.split(".");
  let fileName = parts[0];
  const nestedPath = removePrefix(fileKey, fileName);
  const file = await fetchDataJson(fileName);
  const fileTujuan = getNestedValue(file, nestedPath);
  if (!Array.isArray(fileTujuan)) {
    return console.error("File tujuan tidak ada");
  }
  
  const data = Object.fromEntries(new FormData(form).entries());
  insertWithAutoId(fileTujuan, data);
  await commit(file);
  showAlert("Data berhasil ditambahkan", "success");
}
async function handleWhatsAppFormSubmit(form){
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
}
async function handleDaftarFormSubmit(form) {
  const data = Object.fromEntries(new FormData(form).entries());
  if (data.password !== data.confirm_password){
    showAlert("Password tidak sama","error");
  }

  const tokenRes = await fetch(`${_dekeku.urlApi}/token`);
  const tokenData = await tokenRes.json();
  if (!tokenData || !tokenData.token) {
    throw new Error("Gagal mendapatkan token.");
  }
  const dataEn = await encryptAESGCM(JSON.stringify(data), tokenData.key);

  const payload = {
    token:tokenData.token,
    data: dataEn,
  };
    const res = await fetch(`${_dekeku.urlApi}/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const response = await res.json();
    if (!res.ok) {
      showAlert(response.error, "error");
    }
      else {
      showAlert("Pendaftaran berhasil!", "success");
      localStorage.setItem("user", JSON.stringify(response.data));
      window.location.replace('./');
    } 
}
async function handleMasukFormSubmit(form) {
  const data = Object.fromEntries(new FormData(form).entries());
  if (data.username === "" || data.password === "") {
    showAlert("Data tidak lengkap","error");
    return;
  }

  const tokenRes = await fetch(`${_dekeku.urlApi}/token`);
  const tokenData = await tokenRes.json();
  if (!tokenData || !tokenData.token) {
    throw new Error("Gagal mendapatkan token.");
  }
  const dataEn = await encryptAESGCM(JSON.stringify(data), tokenData.key);

  const payload = {
    token:tokenData.token,
    data: dataEn,
  };
  const response = await fetch(`${_dekeku.urlApi}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  const result = await response.json();
  if (result.success && result.data) {
    localStorage.setItem("user", JSON.stringify(result.data));
    showAlert("Login berhasil!", "success");
    window.location.replace('./');
  } else {
    showAlert(result.error || "Tidak diketahui","error");
  }
}
// ====================== AKUN ==============================
function checkAccess({ requireLogin = false, requireGuest = false, allowedRoles = [] } = {}) {
  const user = _dekeku?.user || null;
  
  if (requireLogin && user === null) {
    window.location.href = "./masuk.html";
    return false;
  }
  
  if (requireGuest && user !== null) {
    window.location.href = "./";
    return false;
  }
  
  if (requireLogin && allowedRoles.length && !allowedRoles.includes(user?.role)) {
    window.location.href = "/403.html";
    return false;
  }

  return true;
}

async function logout() {
    try {
    const response = await fetch(`${_dekeku.urlApi}/logout`);

    const result = await response.json();

    if (result.success) {
      localStorage.removeItem("user");
      window.location.href = './masuk.html';
    } else {
      console.warn("Logout gagal:", result.error || "Tidak diketahui");
    }

  } catch (err) {
    console.error("Gagal memproses logout:", err);
  }

}
// ====================== DATA ATRIBUT ======================
const dataAttributeHandlers = {
  aksi: {
    "github-post": async el => {
      el.addEventListener("submit", async e => {
        e.preventDefault();
        await handleGithubPostFormSubmit(el);
      });
    },
    "whatsapp": async el => {
      el.addEventListener("submit", async e => {
        e.preventDefault();
        await handleWhatsAppFormSubmit(el);
      });
    },
    "daftar": async el => {
      el.addEventListener("submit", async e => {
        e.preventDefault();
        await handleDaftarFormSubmit(el);
      });
    },
    "masuk": async el => {
      el.addEventListener("submit", async e => {
        e.preventDefault();
        await handleMasukFormSubmit(el);
      });
    }
  },
  variabel: {
    "link-wa": el => {
      el.setAttribute("href", `https://wa.me/${_dekeku.repo.waAdmin}`);
      el.setAttribute("target", "_blank");
    }
  }
};

function bindDataAttributes(context = document) {
  Object.keys(dataAttributeHandlers).forEach(attrName => {
    const selector = `[data-${attrName}]:not([data-${attrName}-bound])`;
    context.querySelectorAll(selector).forEach(el => {
      const value = el.dataset[attrName];
      const handler = dataAttributeHandlers[attrName]?.[value];
      if (typeof handler === "function") {
        handler(el);
        el.setAttribute(`data-${attrName}-bound`, "true");
      }
    });
  });
}

// ================== EVENT LISTENER ==================
document.addEventListener('DOMContentLoaded', async () => {
  await initDekeku();
});

window.addEventListener('load', () => {
  hideLoader();
});