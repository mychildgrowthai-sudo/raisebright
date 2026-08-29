(function () {
  'use strict';

  /* Homepage keeps its existing Analytics and consent setup. */
  if (location.pathname === '/' || location.pathname.endsWith('/index.html')) {
    return;
  }

  const consentKey = 'raisebright_analytics_consent';
  const measurementId = 'G-GNJJ7HQCLT';

  /* Do nothing unless analytics was already accepted on the homepage. */
  if (localStorage.getItem(consentKey) !== 'accepted') {
    return;
  }

  window.dataLayer = window.dataLayer || [];

  window.gtag = window.gtag || function () {
    window.dataLayer.push(arguments);
  };

  window.gtag('consent', 'default', {
    analytics_storage: 'denied',
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied'
  });

  window.gtag('consent', 'update', {
    analytics_storage: 'granted',
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied'
  });

  const script = document.createElement('script');
  script.async = true;
  script.src =
    'https://www.googletagmanager.com/gtag/js?id=' + measurementId;

  document.head.appendChild(script);

  window.gtag('js', new Date());
  window.gtag('config', measurementId);
})();
