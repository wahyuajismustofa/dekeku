import _dekeku from "../dekekuVar.js";
import { getEncryptedPayload } from "../utils/commit.js";

export async function handleGithubPostFormSubmit(form) {
  try {
    const fileKey = form.dataset.file;
    if (!fileKey) return _dekeku.response = {ok : false, message: "Data-file tidak ditemukan"};
    const data = getDataForm(form);

    const res = await fetch(`${_dekeku.urlApi}/gh/data?action=post`,{
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ detailFile:fileKey, newData: data })
      });

    const resJson = await res.json();
    let file = _dekeku.daftarJson.filter(item => item.file === fileKey)[0];
    let setItem = _dekeku.function.setDataJson(file,resJson.data);
    if (setItem){
      _dekeku.function.saveDekeku();
    }
    if (res.ok) {
		_dekeku.response = {ok : true, message: "Data Berhasil Dikirim"};
    } else {
		_dekeku.response = {ok : false, message: resJson.message};
    }
  } catch (err) {
	  _dekeku.response = {ok : false, message: err};
  }
}

export async function handleGithubUpdateFormSubmit(form) {
  try {
    const fileKey = form.dataset.file;
    const fileFilter = form.dataset.filter;
    if (!fileKey) return _dekeku.response = {ok : false, message: "data-file belum di setting"};
    if (!fileFilter) return _dekeku.response = {ok : false, message: "data-filter belum di setting"};
	const query = JSON.parse(fileFilter);
    const data = getDataForm(form);

    const res = await fetch(`${_dekeku.urlApi}/gh/data?action=update`,{
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ detailFile:fileKey, newData: data, query: query })
      });

    const resJson = await res.json();
    let file = _dekeku.daftarJson.filter(item => item.file === fileKey)[0];
    let setItem = _dekeku.function.setDataJson(file,resJson.data);
    if (setItem){
      _dekeku.function.saveDekeku();
	  _dekeku.response = {ok : true, message: "Berhasil Update data"};
    }
    if (res.ok) {
      _dekeku.response = {ok : true, message: "Berhasil Update data"};
    } else {
	  _dekeku.response = {ok : false, message: resJson.message};
    }
  } catch (err) {
	_dekeku.response = {ok : false, message: err};
  }
}

export async function handleDaftarFormSubmit(form) {
  const data = getDataForm(form);

  if (!data.username || !data.password || !data.confirm_password) {
    _dekeku.response = {ok : false, message: "Semua field wajib diisi"};
	return;
  }

  data.username = data.username.toLowerCase();
  if (!/^[a-z0-9_]{3,20}$/.test(data.username)) {
    _dekeku.response = {ok : false, message: "Username harus 3–20 karakter, huruf kecil, angka, atau underscore"};
	return;
	
  }

  if (
    !/^.{8,20}$/.test(data.password) ||
    !/[A-Z]/.test(data.password) ||
    !/[a-z]/.test(data.password) ||
    !/[0-9]/.test(data.password) ||
    !/[!@#\$%\^\&\*]/.test(data.password)
  ) {
    _dekeku.response = {ok : false, message: "Password min 8 karakter dan mengandung huruf besar, kecil, angka, dan simbol."};
	return;
  }

  if (data.password !== data.confirm_password) {
	_dekeku.response = {ok : false, message: "Password dan konfirmasi tidak sama"};
    return;
  }

  try {
    const payload = await getEncryptedPayload(data, _dekeku.urlApi);
    const res = await fetch(`${_dekeku.urlApi}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const response = await res.json();
    if (!res.ok) {
		_dekeku.response = {ok : false, message: response.error};
    } else {
      localStorage.setItem("user", JSON.stringify(response.data));
      _dekeku.response = {ok : true, message: "Pendaftaran Berhasil"};
    }
  } catch (err) {
    console.error("Gagal daftar:", err);
	_dekeku.response = {ok : false, message: err};
  }
}

export async function handleMasukFormSubmit(form) {
  const data = getDataForm(form);

  if (!data.username || !data.password) {
    _dekeku.response = {ok : false, message: "Username dan password wajib diisi"};
	return;
	
  }

  data.username = data.username.toLowerCase();

  try {
    const payload = await getEncryptedPayload(data, _dekeku.urlApi);
    const response = await fetch(`${_dekeku.urlApi}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const result = await response.json();
    if (response.ok && result.success) {
      localStorage.setItem("user", JSON.stringify(result.data));
      notifySuccess("Login berhasil!", './');
    } else {
	  _dekeku.response = {ok : false, message: result.error};
    }
  } catch (err) {
    console.error("Gagal login:", err);
	_dekeku.response = {ok : false, message: err};
  }
}

function getDataForm(form) {
  const fd = new FormData(form);
  const obj = {};

  for (const [rawKey, value] of fd.entries()) {
    const field = form.querySelector(`[name="${rawKey}"]`);
    if (field && field.hasAttribute("data-ignore")) continue;
	if (field && field.dataset.type === "timestamp") {
      obj[rawKey] = new Date().toISOString();
      continue;
    }

    // normalisasi nama key (misal: acara[] → acara)
    const key = rawKey.endsWith("[]") ? rawKey.slice(0, -2) : rawKey;
    const isArrayField =
      rawKey.endsWith("[]") ||
      (field && field.type === "checkbox") ||
      (field && field.multiple);

    // jika multiple select → simpan sebagai array
    if (field && field.tagName === "SELECT" && field.multiple) {
      obj[key] = Array.from(field.selectedOptions).map(opt => opt.value);
      continue;
    }

    if (!(key in obj)) {
      obj[key] = isArrayField ? [value] : value;
    } else if (Array.isArray(obj[key])) {
      obj[key].push(value);
    } else {
      obj[key] = [obj[key], value];
    }
  }

  // pastikan checkbox yang tidak dipilih tetap muncul (sebagai [])
  const checkboxNames = new Set(
    Array.from(form.querySelectorAll('input[type="checkbox"][name]'))
      .filter(el => !el.hasAttribute("data-ignore"))
      .map(el => el.name.endsWith("[]") ? el.name.slice(0, -2) : el.name)
  );
  checkboxNames.forEach(name => {
    if (!(name in obj)) obj[name] = [];
  });

  // isi nilai default jika kosong dan ada data-default
  form.querySelectorAll("[name][data-default]").forEach(el => {
    const key = el.name.endsWith("[]") ? el.name.slice(0, -2) : el.name;
    if (!obj[key] || obj[key].length === 0) {
      obj[key] = el.getAttribute("data-default");
    }
  });

  return obj;
}

function notifySuccess(message, redirectTo = null) {
  _dekeku.response = {ok : true, message: message};
  if (redirectTo) window.location.replace(redirectTo);
}