export async function fetchDataJson(file, repo) {
  const { username, repo: repoName } = repo;
  console.log("Dekeku Memuat: ", file);
  const url = `https://raw.githubusercontent.com/${username}/${repoName}/refs/heads/main/assets/data/${file}.json?t=${Date.now()}`;

  try {
  const response = await fetch(url);

    if (!response.ok) return {};

    try {
      return await response.json();
    } catch (err) {
      console.error(`Gagal parse JSON dari ${url}:`, err);
      return {};
    }
  } catch (err) {
    console.error(`Gagal fetch ${url}:`, err);
    return {};
  }
}

export async function fetchDataJsonAPI(file, urlApi) {
  const url = `${urlApi}/gh/get?data=${file}`;

  try {
  const response = await fetch(url);

    if (!response.ok) return {};

    try {
      return await response.json();
    } catch (err) {
      console.error(`Gagal parse JSON dari ${url}:`, err);
      return {};
    }
  } catch (err) {
    console.error(`Gagal fetch ${url}:`, err);
    return {};
  }
}

export async function loadAllData(dekeku, force = false) {
  dekeku.dataJson = dekeku.dataJson || {};
  for (const file of dekeku.daftarJson) {
    if (!force && dekeku.dataJson[file]) {
      continue;
    }

    try {
      const data = await fetchDataJson(file, dekeku.repo);
      dekeku.dataJson[file] = data;
    } catch (err) {
      console.error(`Error memuat ${file}:`, err);
    }
  }
}


