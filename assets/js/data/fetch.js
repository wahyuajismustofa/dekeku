import { isNonEmptyObject } from "../utils/jsonHandler.js";
import sift from "https://cdn.jsdelivr.net/npm/sift@16.0.0/es/index.min.js";

export async function fetchDataJson(file, repo) {
  const { username, repo: repoName } = repo;
  const infoFile = file.file.split(".");
  const fileName = infoFile.shift();
  const path = infoFile;
  console.log("Dekeku Memuat: ", file);
  const url = `https://raw.githubusercontent.com/${username}/${repoName}/refs/heads/main/assets/data/${fileName}.json?t=${Date.now()}`;

  try {
  const response = await fetch(url);

    if (!response.ok) return {};

    try {
      const data = await response.json();
      let target = data;
      if (path.length > 0){
        for (let i = 0; i < path.length ; i++) {
          if (!target[path[i]]) {
            target[path[i]] = {};
          }
          target = target[path[i]];
        }
      }
      if (isNonEmptyObject(file.filter)){
        target = target.filter(sift(file.filter));
      }
      if (file.obj){
          target = target[0];
      }      
      return target;

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
    if (!force && dekeku.dataJson[file.nama]) {
      continue;
    }

    try {
      const data = await fetchDataJson(file, dekeku.repo);
      dekeku.dataJson[file.nama] = data;
    } catch (err) {
      console.error(`Error memuat ${file}:`, err);
    }
  }
}


