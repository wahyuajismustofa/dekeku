export function gtag(id_gtag) {
  const isValidID = /^[A-Z0-9\-]+$/.test(id_gtag);
  if (!isValidID) {
    console.warn("ID GTag tidak valid:", id_gtag);
    return;
  }
  
  if (window._gtagInitialized) return;
  window._gtagInitialized = true;
  
  const gtagScript = document.createElement('script');
  gtagScript.async = true;
  gtagScript.src = `https://www.googletagmanager.com/gtag/js?id=${id_gtag}`;

  const inlineScript = document.createElement('script');
  inlineScript.textContent = `
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', '${id_gtag}');
  `;

  const head = document.head || document.getElementsByTagName('head')[0];
  head.appendChild(gtagScript);
  head.appendChild(inlineScript);
}
