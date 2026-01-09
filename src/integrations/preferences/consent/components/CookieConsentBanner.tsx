// src/components/preferences/consent/CookieConsentBanner.tsx
/**
 * Cookie Consent Banner
 *
 * Initial consent prompt that appears for first-time visitors.
 * Loads eagerly on first user interaction via client:firstInteraction.
 *
 * After consent is given, enables scripts via scriptManager.
 */

import { useState, useEffect, useTransition, lazy, Suspense } from "react";
import { useCookieStorage } from "@/hooks/useCookieStorage";
import { enableConsentedScripts } from "@/integrations/preferences/consent/scripts/scriptManager";
import Modal from "@/components/Modal";
import type { CookieConsent } from "../types";
import Button from "@/components/Button/Button";

const CookiePreferencesModal = lazy(() => import("./CookiePreferencesModal"));

export default function CookieConsentBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { setCookie } = useCookieStorage();

  useEffect(() => {
    // Check if consent already exists (returning user)
    if (document.cookie.includes("cookie-consent=")) {
      // Enable consented scripts for returning users
      enableConsentedScripts();
      return;
    }

    // New user - show banner
    setShowBanner(true);
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
    setCookie("cookie-consent", JSON.stringify(consent), { expires: 365 });

    // Enable all consented scripts immediately
    enableConsentedScripts();

    // Dispatch custom event for cross-tab/component sync
    window.dispatchEvent(new Event("consent-changed"));

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
    setCookie("cookie-consent", JSON.stringify(consent), { expires: 365 });

    // Enable only necessary scripts (if any)
    enableConsentedScripts();

    // Dispatch custom event
    window.dispatchEvent(new Event("consent-changed"));

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
        className="consent-banner"
        overlayClass="bg-transparent pointer-events-none"
        allowScroll={true}
        ssr={false}
        ariaLabel="Cookie consent banner"
      >
        <div className="outer-card-transition group text-left">
          <div className="outer-card-style card-bg-2">
            <div
              className="inner-card-style inner-card-transition inner-card-color"
              aria-hidden="true"
            />
            <div className="relative z-10 flex flex-col gap-6">
              <div className="flex items-start gap-3">
                <span className="text-2xl" role="img" aria-label="Cookie">
                  🍪
                </span>
                <p className="text-sm text-text leading-relaxed">
                  We use cookies to improve your browsing experience and for
                  marketing purposes.{" "}
                  <Button
                    variant="link"
                    onClick={handleOpenSettings}
                    type="button"
                  >
                    Manage preferences
                  </Button>
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  variant="secondary"
                  onClick={handleRejectAll}
                  fullWidth={true}
                  type="button"
                  buttonWrapperClasses="text-center"
                  size="md"
                  disabled={isPending}
                >
                  Reject All
                </Button>
                <Button
                  variant="primary"
                  onClick={handleAcceptAll}
                  fullWidth={true}
                  className="flex-1"
                  animated={false}
                  type="button"
                  size="md"
                  disabled={isPending}
                >
                  Accept All
                </Button>
              </div>
            </div>
          </div>
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
