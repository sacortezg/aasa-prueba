(function() {
  const ua = navigator.userAgent.toLowerCase();
  const urlParams = new URLSearchParams(window.location.search);
  const appId = urlParams.get('app') || defaultApp;
  const config = appConfigs[appId];

  if (!config) {
    console.error('App no encontrada:', appId);
    window.location = 'https://fallback-general.com';
    return;
  }

  // --- NUEVO: Mostrar banner en Safari iOS ---
  const isIOS = /iphone|ipad|ipod/.test(ua);
  const isSafari = /safari/i.test(ua) && !/crios|fxios|opr\//i.test(ua);
  const hasHiddenBanner = localStorage.getItem('hideSmartBanner') === '1';

  if (isIOS && isSafari && !hasHiddenBanner) {
    showSmartBanner(config);
    return; // detener redirección automática
  }

  // Si no es iOS Safari, continuar con la redirección normal
  redirect();

  function redirect() {
    if (/android/.test(ua)) {
      attemptDeepLink(config.deepLinkScheme + 'deep-path', () => {
        window.location = config.android.playStoreUrl;
      });
    } else if (isIOS) {
      if (isIOSVersionAtLeast(9)) {
        attemptDeepLink(config.deepLinkScheme, () => {
          window.location = config.ios.appStoreUrl;
        });
      } else {
        window.location = config.ios.appStoreUrl;
      }
    } else {
      window.location = config.desktop.customUrl;
    }
  }

  function attemptDeepLink(deepLink, fallback) {
    const start = Date.now();
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.src = deepLink;
    document.body.appendChild(iframe);

    setTimeout(() => {
      document.body.removeChild(iframe);
      if (Date.now() - start < 3000) fallback();
    }, 2000);
  }

  function isIOSVersionAtLeast(version) {
    const match = ua.match(/os (\d+)_/);
    return match && parseInt(match[1], 10) >= version;
  }

  // --- Smart Banner personalizado ---
  function showSmartBanner(config) {
    const banner = document.getElementById('smart-banner');
    const openBtn = document.getElementById('sb-open');
    const closeBtn = document.getElementById('sb-close');

    document.body.classList.add('has-smart-banner');
    banner.style.display = 'block';

    // Universal Link hacia la app (sin forzar esquema)
    openBtn.href = config.deepLinkScheme + 'event/123?utm_source=smart_banner';

    openBtn.addEventListener('click', () => {
      // Universal Link → abrirá la app si está instalada
      // Safari manejará el fallback automáticamente (no hacer nada aquí)
    });

    closeBtn.addEventListener('click', () => {
      banner.style.display = 'none';
      document.body.classList.remove('has-smart-banner');
      localStorage.setItem('hideSmartBanner', '1');
    });
  }
})();
