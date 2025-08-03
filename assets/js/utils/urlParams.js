// utils/urlParams.js

export function writeURLParams(obj) {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(obj)) {
    if (value !== "") {
      params.set(key, value);
    }
  }

  const newURL = `${window.location.pathname}?${params.toString()}`;
  history.replaceState(null, "", newURL);
}

export function readURLParams() {
  const params = new URLSearchParams(window.location.search);
  const obj = {};

  for (const [key, value] of params.entries()) {
    obj[key] = value;
  }

  return obj;
}
