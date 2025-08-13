// ========================== ALERT ==========================
export function showAlert(message, type = 'info', duration = 3000) {
  const existing = document.getElementById('wrapperAlert');
  if (existing) existing.remove();
  const typeMap = {
    error: 'danger',
    success: 'success',
    info: 'info',
    warning: 'warning'
  };
  type = typeMap[type] || type;
  const wrapper = document.createElement('div');
  wrapper.id = 'wrapperAlert';
  wrapper.className = 'position-fixed start-50 translate-middle-x mt-3';
  wrapper.style.zIndex = '1055';
  wrapper.style.width = '80vw';
  wrapper.style.top = '20px';
  wrapper.style.left = '50%';
  wrapper.style.transform = 'translateX(-50%)';

  const alert = document.createElement('div');
  alert.className = `alert alert-${type} shadow-soft`;
  alert.role = 'alert';

  const messageSpan = document.createElement('span');
  messageSpan.className = 'alert-inner--text';
  messageSpan.textContent = message;

  const closeBtn = document.createElement('button');
  closeBtn.type = 'button';
  closeBtn.className = 'close';
  closeBtn.setAttribute('data-dismiss', 'alert');
  closeBtn.setAttribute('aria-label', 'Close');
  closeBtn.innerHTML = `<span aria-hidden="true">&times;</span>`;

  alert.appendChild(closeBtn);
  alert.appendChild(messageSpan);
  wrapper.appendChild(alert);
  document.body.appendChild(wrapper);

  if (duration > 0) {
    setTimeout(() => {
      alert.style.opacity = '0';
      setTimeout(() => wrapper.remove(), 300);
    }, duration);
  }
}
window.alert = function(message) {
  showAlert(message, 'error');
};

// ========================== UTILS ==========================
export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function copyToClipboard(text) {
  const temp = document.createElement('textarea');
  temp.value = text;
  temp.setAttribute('readonly', '');
  temp.style.position = 'absolute';
  temp.style.left = '-9999px';
  document.body.appendChild(temp);
  temp.select();
  document.execCommand('copy');
  document.body.removeChild(temp);
}

export function formatDate(date = new Date()) {
  return [
    String(date.getDate()).padStart(2, '0'),
    String(date.getMonth() + 1).padStart(2, '0'),
    date.getFullYear()
  ].join('/');
}

export function getFormData(formElement) {
  const formData = new FormData(formElement);
  return Object.fromEntries(formData.entries());
}

export function debounce(fn, delay = 300) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn.apply(this, args), delay);
  };
}

export function waitForVariable(valueGetter, callbackOrOptions = {}, timeout = 10000, interval = 100) {
  const start = Date.now();
  const isCallback = typeof callbackOrOptions === 'function';
  const options = isCallback ? {} : callbackOrOptions;
  const callback = isCallback ? callbackOrOptions : options.callback;

  const check = (resolve, reject) => {
    try {
      const value = valueGetter();

      const isReady =
        (typeof value === 'string' && value.trim() !== '') ||
        (Array.isArray(value) && value.length > 0) ||
        (typeof value === 'object' && value !== null && Object.keys(value).length > 0);

      if (isReady) {
        if (callback) callback(value);
        resolve(value);
      } else if (Date.now() - start >= timeout) {
        const err = new Error('⏱️ Timeout: variabel belum tersedia');
        if (callback) console.warn(err.message);
        reject(err);
      } else {
        setTimeout(() => check(resolve, reject), interval);
      }
    } catch (e) {
      if (Date.now() - start >= timeout) {
        if (callback) console.error(e);
        reject(e);
      } else {
        setTimeout(() => check(resolve, reject), interval);
      }
    }
  };

  return new Promise(check);
}

export function waitForCondition(conditionFn, callback, options = {}) {
  const {
    interval = 50,
    timeout = 10000,
    onTimeout = () => console.warn("⏰ waitForCondition timeout tercapai"),
  } = options;

  const start = Date.now();

  const check = () => {
    try {
      if (conditionFn()) {
        callback();
      } else if (Date.now() - start >= timeout) {
        onTimeout();
      } else {
        setTimeout(check, interval);
      }
    } catch (err) {
      console.error("❌ waitForCondition error:", err);
      onTimeout();
    }
  };

  check();
}

export function makeGlobal(fnObj, target = window) {
  if (typeof fnObj !== 'object' || fnObj === null) return;

  for (const [key, value] of Object.entries(fnObj)) {
    if (typeof value === 'function') {
      target[key] = value;
    }
  }
}

export function defineOrIncrement(obj, key, initial) {
  if (typeof obj[key] === 'undefined') {
    obj[key] = initial;
  } else {
    obj[key] += 1;
  }
}

export function getJsonFromSession (key) {
  try {
    const storedData = sessionStorage.getItem(key);
    if (!storedData) return null;

    return JSON.parse(storedData);
  } catch (error) {
    console.error(`Gagal parse data untuk key "${key}":`, error);
    return null;
  }
}
export function saveJsonToSession (key, value) {
  try {
    sessionStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Gagal simpan data untuk key "${key}":`, error);
  }
}
