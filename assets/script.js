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

  addSmartBannerMeta(config);

  redirect();

  function addSmartBannerMeta(config) {
    const isIOS = /iphone|ipad|ipod/.test(ua);
    const isSafari = /safari/i.test(ua) && !/crios|fxios|opr\//i.test(ua);

    if (!isIOS || !isSafari) return; // Solo Safari iOS muestra el banner

    const meta = document.createElement('meta');
    meta.name = 'apple-itunes-app';
    meta.content = `app-id=${config.ios.appId}, app-argument=${config.deepLinkScheme}`;
    document.head.appendChild(meta);
  }

  function redirect() {
    if (/android/.test(ua)) {
      attemptDeepLink(config.deepLinkScheme + 'deep-path', () => {
        window.location = config.android.playStoreUrl;
      });
    } else if (/iphone|ipad|ipod/.test(ua)) {
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
      if (Date.now() - start < 3000) {
        fallback();
      }
    }, 2000);
  }

  function isIOSVersionAtLeast(version) {
    const match = ua.match(/os (\d+)_/);
    return match && parseInt(match[1], 10) >= version;
  }
})();
