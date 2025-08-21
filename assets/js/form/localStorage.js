export function localStorageFormHandler(form) {
  if (!form) return;

  const storageKey = form.dataset.nama || "tamuUndangan";
  const scema = JSON.parse(form.dataset.scema || "{}");

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const formData = {};

    for (const key in scema) {
      const type = scema[key];
      let value = form.elements[key]?.value?.trim();

      if (!value) {
        alert(`Field "${key}" harus diisi!`);
        return;
      }

      formData[key] = type === "array"
        ? value.split(",").map(v => v.trim()).filter(v => v)
        : value;
    }

    let data = JSON.parse(localStorage.getItem(storageKey)) || [];

    const arrayKeys = Object.keys(scema).filter(k => scema[k] === "array");

    function cartesian(arrays) {
      return arrays.reduce((a, b) => a.flatMap(d => b.map(e => [...d, e])), [[]]);
    }

    const arrayValues = arrayKeys.map(k => formData[k]);
    const combinations = cartesian(arrayValues);

    combinations.forEach(comb => {
      const newItem = {};
      let i = 0;

      for (const key in scema) {
        if (scema[key] === "array") {
          newItem[key] = comb[i++];
        } else {
          newItem[key] = formData[key];
        }
      }

      const exists = data.some(d =>
        Object.keys(scema).every(k =>
          d[k] === newItem[k]
        )
      );

      if (!exists) data.push(newItem);
    });

    localStorage.setItem(storageKey, JSON.stringify(data));

    if (typeof showAlert === "function") {
      showAlert("Berhasil menambahkan data!", "success");
    } else {
      alert("Berhasil menambahkan data!");
    }

    form.reset();
  });
}
