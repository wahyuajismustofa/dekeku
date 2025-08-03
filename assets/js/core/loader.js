export function hideLoader() {
  const loader = document.getElementById('loadingScreen');
  if (loader) {
    loader.style.opacity = '0';
    setTimeout(() => {
      loader.innerHTML = '';
      loader.className = '';
      loader.style = '';        
    }, 500);
  }
}