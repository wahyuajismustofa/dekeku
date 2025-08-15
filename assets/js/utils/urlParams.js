// utils/urlParams.js

function encodeUrlSafe(str) {
  return btoa(str)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function decodeUrlSafe(str) {
  const base64 = str
    .replace(/-/g, "+")
    .replace(/_/g, "/")
    .padEnd(str.length + (4 - str.length % 4) % 4, "=");
  return atob(base64);
}

export function writeURLParams(obj) {
  try {
    const jsonString = JSON.stringify(obj);
    const encoded = encodeUrlSafe(jsonString);

    const params = new URLSearchParams();
    params.set("d", encoded);

    const newURL = `${window.location.pathname}?${params.toString()}`;
    history.replaceState(null, "", newURL);
  } catch (err) {
    console.error("Gagal encode URL params:", err);
  }
}

export function readURLParams() {
  const params = new URLSearchParams(window.location.search);
  const encoded = params.get("d");
  if (!encoded) return {};

  try {
    const decoded = decodeUrlSafe(encoded);
    return JSON.parse(decoded);
  } catch (err) {
    console.error("Gagal decode URL params:", err);
    return {};
  }
}
