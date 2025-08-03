import { removePrefix, getNestedValue, insertWithAutoId } from "../utils/jsonHandler.js";
import { fetchDataJson } from "../data/fetch.js";
import { createCommit,getEncryptedPayload } from "../utils/commit.js";
import { showAlert } from "../utils/utils.js";

const commit = createCommit(window._dekeku);

export async function handleGithubPostFormSubmit(form) {
  try {
    const fileKey = form.dataset.file;
    if (!fileKey) return showAlert("Data-file tidak ditemukan", "error");

    const parts = fileKey.split(".");
    const fileName = parts[0];
    const nestedPath = removePrefix(fileKey, fileName);
    const file = await fetchDataJson(fileName);
    const fileTujuan = getNestedValue(file, nestedPath);

    if (!Array.isArray(fileTujuan)) {
      return showAlert("Target data tidak valid", "error");
    }

    const data = Object.fromEntries(new FormData(form).entries());

    insertWithAutoId(fileTujuan, data);
    await commit(file);
    showAlert("Data berhasil ditambahkan", "success");
  } catch (err) {
    console.error("Error handleGithubPostFormSubmit:", err);
    showAlert("Terjadi kesalahan saat menambahkan data", "error");
  }
}

export async function handleDaftarFormSubmit(form) {
  const data = Object.fromEntries(new FormData(form).entries());

  if (!data.username || !data.password || !data.confirm_password) {
    return showAlert("Semua field wajib diisi", "error");
  }
  
  if (!/^[a-zA-Z0-9_]{3,20}$/.test(data.username)) {
    return showAlert("Username tidak valid", "error");
  }

  if (!/^[a-zA-Z0-9!@#\$%\^\&*]{9,}$/.test(data.password)) {
  return showAlert("Password minimal 9 karakter dan valid", "error");
  }


  if (data.password !== data.confirm_password) {
    return showAlert("Password tidak sama", "error");
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
      showAlert(response.error, "error");
    } else {
      localStorage.setItem("user", JSON.stringify(response.data));
      notifySuccess("Pendaftaran berhasil!", './');
    }
  } catch (err) {
    console.error("Gagal daftar:", err);
    showAlert("Pendaftaran gagal", "error");
  }
}

// Form: Masuk
export async function handleMasukFormSubmit(form) {
  const data = Object.fromEntries(new FormData(form).entries());

  if (!data.username || !data.password) {
    return showAlert("Username dan password wajib diisi", "error");
  }

  try {
    const payload = await getEncryptedPayload(data, _dekeku.urlApi);
    const response = await fetch(`${_dekeku.urlApi}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
    });

    const result = await response.json();
    if (result.success && result.data) {
      localStorage.setItem("user", JSON.stringify(result.data));
      notifySuccess("Login berhasil!", './');
    } else {
      showAlert(result.error || "Login gagal", "error");
    }
  } catch (err) {
    console.error("Gagal login:", err);
    showAlert("Terjadi kesalahan saat login", "error");
  }
}

function notifySuccess(message, redirectTo = null) {
  showAlert(message, 'success');
  if (redirectTo) window.location.replace(redirectTo);
}