"use client";

import { useEffect } from "react";

interface GoogleTranslateWindow extends Window {
  google?: {
    translate: {
      TranslateElement: {
        new (
          config: {
            pageLanguage: string;
            includedLanguages: string;
            layout: string;
            autoDisplay: boolean;
          },
          elementId: string
        ): void;
        InlineLayout: {
          SIMPLE: string;
          HORIZONTAL: string;
          VERTICAL: string;
        };
      };
    };
  };
  googleTranslateElementInit?: () => void;
}

declare let window: GoogleTranslateWindow;

const GoogleTranslate: React.FC = () => {
  useEffect(() => {
    const addGoogleTranslateScript = () => {
      if (!window.googleTranslateElementInit) {
        const script = document.createElement("script");
        script.src =
          "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
        script.async = true;
        document.body.appendChild(script);

        window.googleTranslateElementInit = () => {
          if (window.google?.translate?.TranslateElement) {
            new window.google.translate.TranslateElement(
              {
                pageLanguage: "en",
                includedLanguages: "en,zh-TW,es,fr,de,ja,ko,ru,ar",
                layout:
                  window.google.translate.TranslateElement.InlineLayout.SIMPLE,
                autoDisplay: false,
              },
              "google_translate_element"
            );
          }
        };
      }
    };

    addGoogleTranslateScript();

    return () => {
      const scripts = document.querySelectorAll(
        'script[src="//translate.google.com/translate_a/element.js"]'
      );
      scripts.forEach((script) => script.remove());
      delete window.googleTranslateElementInit;
    };
  }, []);

  return (
      <div
        className="fixed bottom-5 right-5 z-[200]"
        id="google_translate_element"
      />
  );
};

export default GoogleTranslate;
