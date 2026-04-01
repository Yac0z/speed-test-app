(function () {
  const theme = localStorage.getItem('speed-test-theme') || 'dark';
  const resolved = theme === 'system'
    ? (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark')
    : theme;
  if (resolved === 'dark') {
    document.documentElement.classList.add('dark');
  }
})();
