(function () {
  'use strict';

  /* The homepage keeps its existing inline Analytics and consent setup. */
  if (location.pathname === '/' || location.pathname.endsWith('/index.html')) {
    return;
  }

  /* Prevent duplicate UI and event handlers if the file is included twice. */
  if (window.__raisebrightConsentInitialized) {
    return;
  }
  window.__raisebrightConsentInitialized = true;

  const CONSENT_KEY = 'raisebright_analytics_consent';
  const GOOGLE_TAG_ID = 'G-YKYF68PV7K';
  const MEASUREMENT_ID = 'G-GNJJ7HQCLT';
  const GA_SCRIPT_ID = 'raisebright-ga4-script';
  const CONSENT_STYLE_ID = 'raisebright-consent-styles';

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () {
    window.dataLayer.push(arguments);
  };

  /* Google Consent Mode v2: everything is denied until the visitor accepts. */
  window.gtag('consent', 'default', {
    analytics_storage: 'denied',
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied'
  });

  let previousFocus = null;

  function getSavedConsent() {
    try {
      return localStorage.getItem(CONSENT_KEY);
    } catch (error) {
      return null;
    }
  }

  function saveConsent(value) {
    try {
      localStorage.setItem(CONSENT_KEY, value);
    } catch (error) {
      /* The choice still applies to the current page if storage is unavailable. */
    }
  }

  function updateAnalyticsConsent(value) {
    window.gtag('consent', 'update', {
      analytics_storage: value,
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied'
    });
  }

  function loadAnalytics() {
    /* This must run even when GA4 is already loaded, so consent can be re-granted. */
    updateAnalyticsConsent('granted');

    const existingScript = document.querySelector(
      'script[src*="googletagmanager.com/gtag/js"]'
    );

    if (!existingScript) {
      const script = document.createElement('script');
      script.id = GA_SCRIPT_ID;
      script.async = true;
      script.src =
        'https://www.googletagmanager.com/gtag/js?id=' +
        encodeURIComponent(GOOGLE_TAG_ID);
      document.head.appendChild(script);
      window.gtag('js', new Date());
    }

    if (!window.__raisebrightGa4Configured) {
      window.__raisebrightGa4Configured = true;
      window.gtag('config', MEASUREMENT_ID);
    }
  }

  function clearAnalyticsCookies() {
    const analyticsCookie = /^(_ga($|_)|_gid$|_gat($|_))/;
    const cookieNames = document.cookie
      .split(';')
      .map(function (cookie) {
        return cookie.split('=')[0].trim();
      })
      .filter(Boolean);

    const hostname = location.hostname;
    const baseHostname = hostname.replace(/^www\./, '');
    const domains = Array.from(
      new Set([hostname, '.' + hostname, baseHostname, '.' + baseHostname])
    );

    cookieNames.forEach(function (name) {
      if (!analyticsCookie.test(name)) {
        return;
      }

      document.cookie =
        name + '=; Max-Age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;';

      domains.forEach(function (domain) {
        document.cookie =
          name +
          '=; Max-Age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=' +
          domain +
          ';';
      });
    });
  }

  function addConsentStyles() {
    if (document.getElementById(CONSENT_STYLE_ID)) {
      return;
    }

    const style = document.createElement('style');
    style.id = CONSENT_STYLE_ID;
    style.textContent = `
      .consent-banner {
        position: fixed;
        left: 16px;
        right: 16px;
        bottom: 16px;
        z-index: 10000;
        max-width: 560px;
        margin: 0 auto;
        padding: 20px 22px;
        display: none;
        color: #1e332f;
        background: #ffffff;
        border: 1px solid #dee6d9;
        border-radius: 18px;
        box-shadow: 0 20px 50px -20px rgba(30, 51, 47, 0.18);
        font: 14px/1.55 system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      }

      .consent-banner.active {
        display: block;
      }

      .consent-banner p {
        margin: 0 0 14px;
        color: #54685f;
      }

      .consent-banner strong {
        color: #1e332f;
      }

      .consent-actions {
        display: flex;
        align-items: center;
        gap: 10px;
        flex-wrap: wrap;
      }

      .consent-actions button {
        padding: 10px 18px;
        border-radius: 999px;
        cursor: pointer;
        font: inherit;
        font-weight: 700;
      }

      .consent-accept {
        color: #ffffff;
        background: #1a3f3c;
        border: 1px solid #1a3f3c;
      }

      .consent-reject {
        color: #1a3f3c;
        background: transparent;
        border: 1px solid #dee6d9;
      }

      .consent-actions a {
        color: #2b5f5c;
        font-weight: 600;
      }

      #manage-cookies {
        padding: 0;
        color: #54685f;
        background: transparent;
        border: 0;
        cursor: pointer;
        font: inherit;
        font-weight: 600;
      }

      #manage-cookies:hover,
      #manage-cookies:focus-visible {
        color: #2b5f5c;
      }

      .raisebright-cookie-manage-fallback {
        margin: 24px 18px;
        font-size: 14px;
      }

      @media (max-width: 600px) {
        .consent-banner {
          left: 12px;
          right: 12px;
          bottom: 12px;
          padding: 18px;
        }
      }
    `;

    document.head.appendChild(style);
  }

  function getOrCreateBanner() {
    let banner = document.getElementById('consent-banner');

    if (banner) {
      return banner;
    }

    banner = document.createElement('div');
    banner.id = 'consent-banner';
    banner.className = 'consent-banner';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-modal', 'false');
    banner.setAttribute('aria-labelledby', 'consent-title');
    banner.setAttribute('aria-describedby', 'consent-desc');
    banner.setAttribute('aria-hidden', 'true');
    banner.innerHTML = `
      <p id="consent-title"><strong>Your privacy matters</strong></p>
      <p id="consent-desc">We use analytics cookies to understand how visitors use RaiseBright and improve the experience. Analytics is optional and will only be enabled if you accept.</p>
      <div class="consent-actions">
        <button type="button" class="consent-accept" id="consent-accept">Accept analytics</button>
        <button type="button" class="consent-reject" id="consent-reject">Reject analytics</button>
        <a href="/privacy.html">Privacy Policy</a>
      </div>
    `;

    document.body.insertBefore(banner, document.body.firstChild);
    return banner;
  }

  function getOrCreateManageButton() {
    let button = document.getElementById('manage-cookies');

    if (button) {
      return button;
    }

    button = document.createElement('button');
    button.type = 'button';
    button.id = 'manage-cookies';
    button.textContent = 'Manage cookies';
    button.setAttribute('aria-controls', 'consent-banner');

    const footerList = document.querySelector('footer ul');

    if (footerList) {
      const item = document.createElement('li');
      item.appendChild(button);
      footerList.appendChild(item);
    } else {
      const fallback = document.createElement('div');
      fallback.className = 'raisebright-cookie-manage-fallback';
      fallback.appendChild(button);
      const footer = document.querySelector('footer');
      (footer || document.body).appendChild(fallback);
    }

    return button;
  }

  function initializeConsentControls() {
    addConsentStyles();

    const banner = getOrCreateBanner();
    const acceptButton = banner.querySelector('#consent-accept');
    const rejectButton = banner.querySelector('#consent-reject');
    const manageButton = getOrCreateManageButton();

    function showBanner(moveFocus) {
      if (moveFocus) {
        previousFocus = document.activeElement;
      }

      banner.classList.add('active');
      banner.setAttribute('aria-hidden', 'false');

      if (moveFocus) {
        banner.setAttribute('tabindex', '-1');
        banner.focus();
      }
    }

    function hideBanner(restoreFocus) {
      banner.classList.remove('active');
      banner.setAttribute('aria-hidden', 'true');

      if (
        restoreFocus &&
        previousFocus &&
        typeof previousFocus.focus === 'function'
      ) {
        previousFocus.focus();
      }

      previousFocus = null;
    }

    const savedConsent = getSavedConsent();

    if (savedConsent === 'accepted') {
      loadAnalytics();
      hideBanner(false);
    } else if (savedConsent === 'rejected') {
      hideBanner(false);
    } else {
      showBanner(false);
    }

    acceptButton.addEventListener('click', function () {
      saveConsent('accepted');
      loadAnalytics();
      hideBanner(true);
    });

    rejectButton.addEventListener('click', function () {
      saveConsent('rejected');
      updateAnalyticsConsent('denied');
      clearAnalyticsCookies();
      hideBanner(true);
    });

    manageButton.addEventListener('click', function () {
      showBanner(true);
    });

    banner.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && getSavedConsent()) {
        hideBanner(true);
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeConsentControls, {
      once: true
    });
  } else {
    initializeConsentControls();
  }
})();
