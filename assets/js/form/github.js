import _dekeku from "../dekekuVar.js";
import { getEncryptedPayload } from "../utils/commit.js";
import { showAlert } from "../utils/utils.js";

export async function handleGithubPostFormSubmit(form) {
  try {
    const fileKey = form.dataset.file;
    if (!fileKey) return showAlert("Data-file tidak ditemukan", "error");
    const data = Object.fromEntries(new FormData(form).entries());

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
      showAlert("Data Berhasil Dikirim", "success");
    } else {
      showAlert(resJson.message || "Gagal mengirim data", "error");
    }
  } catch (err) {
    console.error("Error handleGithubPostFormSubmit:", err);
  }
}

export async function handleDaftarFormSubmit(form) {
  const data = Object.fromEntries(new FormData(form).entries());

  if (!data.username || !data.password || !data.confirm_password) {
    return showAlert("Semua field wajib diisi", "error");
  }

  data.username = data.username.toLowerCase();
  if (!/^[a-z0-9_]{3,20}$/.test(data.username)) {
    return showAlert("Username harus 3–20 karakter, huruf kecil, angka, atau underscore", "error");
  }

  if (
    !/^.{8,20}$/.test(data.password) ||
    !/[A-Z]/.test(data.password) ||
    !/[a-z]/.test(data.password) ||
    !/[0-9]/.test(data.password) ||
    !/[!@#\$%\^\&\*]/.test(data.password)
  ) {
    return showAlert(
      "Password min 8 karakter dan mengandung huruf besar, kecil, angka, dan simbol.",
      "error"
    );
  }

  if (data.password !== data.confirm_password) {
    return showAlert("Password dan konfirmasi tidak sama", "error");
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
      showAlert(response.error || "Gagal mendaftar", "error");
    } else {
      localStorage.setItem("user", JSON.stringify(response.data));
      notifySuccess("Pendaftaran berhasil!", './');
    }
  } catch (err) {
    console.error("❌ Gagal daftar:", err);
    showAlert("Pendaftaran gagal", "error");
  }
}

export async function handleMasukFormSubmit(form) {
  const data = Object.fromEntries(new FormData(form).entries());

  if (!data.username || !data.password) {
    return showAlert("Username dan password wajib diisi", "error");
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
      showAlert(result.error || "Login gagal", "error");
    }
  } catch (err) {
    console.error("❌ Gagal login:", err);
    showAlert("Terjadi kesalahan saat login", "error");
  }
}



function notifySuccess(message, redirectTo = null) {
  showAlert(message, 'success');
  if (redirectTo) window.location.replace(redirectTo);
}