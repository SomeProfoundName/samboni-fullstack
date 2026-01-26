export function initHashNavigation() {
  if (window.location.hash) {
    window.addEventListener('load', () => {
      const hash = window.location.hash;
      const element = document.querySelector(hash);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    });
  }
}
