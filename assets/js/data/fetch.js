export async function fetchDataJson(file, repo) {
  const { username, repo: repoName } = repo;
  const url = `https://raw.githubusercontent.com/${username}/${repoName}/refs/heads/main/assets/data/${file}.json?t=${Date.now()}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error('Network response was not ok');
  return await response.json();
}

export async function loadAllData(dekeku) {
  dekeku.dataJson = {};
  for (const file of dekeku.daftarJson) {
    try {
      const data = await fetchDataJson(file, dekeku.repo);
      dekeku.dataJson[file] = data;
    } catch (err) {
      console.error(`Error memuat ${file}:`, err);
    }
  }
}
