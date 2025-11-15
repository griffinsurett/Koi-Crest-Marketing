// src/components/preferences/consent/CookieConsentBanner.tsx
/**
 * Cookie Consent Banner
 * 
 * Initial consent prompt that appears for first-time visitors.
 * Lazy loads the detailed preferences modal only when needed.
 * 
 * After consent is given, enables scripts via scriptManager.
 */

import { useState, useEffect, lazy, Suspense, useTransition } from 'react';
import { useCookieStorage } from '@/hooks/useCookieStorage';
import { enableConsentedScripts } from '@/utils/scriptManager';
import Modal from '@/components/Modal';
import type { CookieConsent } from './types';

const CookiePreferencesModal = lazy(() => import('./CookiePreferencesModal'));

export default function CookieConsentBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { getCookie, setCookie } = useCookieStorage();

  useEffect(() => {
    // Quick inline check - if consent exists, don't show banner
    if (document.cookie.includes('cookie-consent=')) return;

    // Delay banner appearance slightly for better UX
    const timer = setTimeout(() => {
      setShowBanner(true);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  const handleAcceptAll = () => {
    const consent: CookieConsent = {
      necessary: true,
      functional: true,
      performance: true,
      targeting: true,
      timestamp: Date.now(),
    };
    
    // Save consent
    setCookie('cookie-consent', JSON.stringify(consent), { expires: 365 });
    
    // Enable all consented scripts immediately
    enableConsentedScripts();
    
    // Dispatch custom event for cross-tab/component sync
    window.dispatchEvent(new Event('consent-changed'));
    
    startTransition(() => {
      setShowBanner(false);
    });
  };

  const handleRejectAll = () => {
    const consent: CookieConsent = {
      necessary: true,
      functional: false,
      performance: false,
      targeting: false,
      timestamp: Date.now(),
    };
    
    // Save minimal consent
    setCookie('cookie-consent', JSON.stringify(consent), { expires: 365 });
    
    // Enable only necessary scripts (if any)
    enableConsentedScripts();
    
    // Dispatch custom event
    window.dispatchEvent(new Event('consent-changed'));
    
    startTransition(() => {
      setShowBanner(false);
    });
  };

  const handleOpenSettings = () => {
    startTransition(() => {
      setShowModal(true);
    });
  };

  return (
    <>
      <Modal
        isOpen={showBanner}
        onClose={() => setShowBanner(false)}
        closeButton={false}
        position="bottom-left"
        className="bg-white border border-transparent rounded-lg p-6 shadow-xl max-w-lg w-full"
        overlayClass="bg-transparent pointer-events-none"
        allowScroll={true}
        ssr={false}
        ariaLabel="Cookie consent banner"
      >
        <div className="mb-4 flex items-start gap-3">
          <span className="text-2xl" role="img" aria-label="Cookie">
            🍪
          </span>
          <div className="flex-1">
            <p className="text-sm text-gray-700">
              We use cookies to improve your browsing experience and for
              marketing purposes.{' '}
              <button
                onClick={handleOpenSettings}
                className="text-blue-600 underline hover:text-blue-700 font-medium"
                type="button"
              >
                Manage preferences
              </button>
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleRejectAll}
            className="flex-1 rounded-lg border-2 border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
            type="button"
            disabled={isPending}
          >
            Reject All
          </button>
          <button
            onClick={handleAcceptAll}
            className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
            type="button"
            disabled={isPending}
          >
            Accept All
          </button>
        </div>
      </Modal>

      {showModal && (
        <Suspense fallback={null}>
          <CookiePreferencesModal
            isOpen={showModal}
            onClose={() => setShowModal(false)}
          />
        </Suspense>
      )}
    </>
  );
}