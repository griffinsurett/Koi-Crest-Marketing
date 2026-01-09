// src/components/Header/HeaderLanguageSwitcher.tsx
/**
 * Compact Language Switcher for Header
 *
 * A minimal language dropdown that fits the header design.
 * Shows flag + language code, expands to full dropdown on click.
 */

import { useState, useRef, useEffect } from "react";
import { useLanguageSwitcher } from "@/integrations/preferences/language/hooks/useLanguageSwitcher";
import Button from "../Button/Button";

export default function HeaderLanguageSwitcher() {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const {
    currentLanguage,
    supportedLanguages,
    hasFunctionalConsent,
    requiresConsent,
    changeLanguage,
    openConsentModal,
  } = useLanguageSwitcher();

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current?.contains(event.target as Node)) return;
      setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // Close on escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen]);

  const handleLanguageChange = (code: string) => {
    const result = changeLanguage(code);
    if (!result.success && result.error) {
      alert(result.error);
      return;
    }
    setIsOpen(false);
  };

  const handleOpenConsent = () => {
    openConsentModal();
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative">
      <Button
        variant="nounderlink"
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="gap-1.5 text-sm"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label="Choose language"
        title={
          hasFunctionalConsent
            ? "Choose language"
            : "Enable functional cookies to change language"
        }
      >
        {currentLanguage.flag && (
          <span className="text-base leading-none notranslate" aria-hidden="true">
            {currentLanguage.flag}
          </span>
        )}
        <span className="hidden sm:inline uppercase notranslate">
          {currentLanguage.code}
        </span>
        <svg
          className={`w-3.5 h-3.5 transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </Button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 min-w-[200px] bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden">
          {requiresConsent && (
            <button
              type="button"
              onClick={handleOpenConsent}
              className="w-full px-4 py-3 text-left text-xs bg-yellow-50 border-b border-yellow-100 hover:bg-yellow-100 transition"
            >
              <span className="block text-yellow-800">
                Enable functional cookies to switch languages.
              </span>
              <span className="block mt-1 font-semibold text-yellow-900 uppercase tracking-wide">
                Manage consent
              </span>
            </button>
          )}

          <div className="max-h-64 overflow-y-auto py-1">
            {supportedLanguages.map((language) => {
              const isActive = language.code === currentLanguage.code;
              const isDisabled = requiresConsent && language.code !== "en";
              return (
                <button
                  key={language.code}
                  type="button"
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition ${
                    isActive
                      ? "bg-gray-100 text-black font-semibold"
                      : "text-gray-700 hover:bg-gray-50"
                  } ${isDisabled ? "cursor-not-allowed opacity-50" : ""}`}
                  onClick={() => handleLanguageChange(language.code)}
                  disabled={isDisabled}
                >
                  {language.flag && (
                    <span className="text-lg" aria-hidden="true">
                      {language.flag}
                    </span>
                  )}
                  <span className="flex-1 text-left">
                    <span className="block leading-tight notranslate">
                      {language.nativeName}
                    </span>
                    <span className="text-xs text-gray-500 notranslate">
                      {language.name}
                    </span>
                  </span>
                  {isActive && (
                    <svg
                      viewBox="0 0 24 24"
                      className="w-4 h-4 text-black"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M5 12l4 4L19 7" />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
