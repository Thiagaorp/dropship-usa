"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Cookie } from "lucide-react";

const STORAGE_KEY = "cookie-consent";

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Show only if the user hasn't made a choice yet
    try {
      const choice = localStorage.getItem(STORAGE_KEY);
      if (!choice) setVisible(true);
    } catch {
      // localStorage unavailable (private mode) — don't block the page
    }
  }, []);

  function decide(consent: "accepted" | "declined") {
    try {
      localStorage.setItem(STORAGE_KEY, consent);
    } catch {
      // ignore
    }
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 p-4 sm:p-6">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl border border-gray-200 shadow-xl p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
          <Cookie className="w-6 h-6" />
        </div>

        <div className="flex-1">
          <p className="font-semibold text-gray-900 mb-1">We value your privacy</p>
          <p className="text-sm text-gray-600 leading-relaxed">
            We use cookies to keep items in your cart, remember your preferences, and analyze site
            traffic. You can accept all cookies or continue with only the essential ones. Read our{" "}
            <Link href="/privacy" className="text-blue-600 font-medium hover:underline">
              Privacy Policy
            </Link>
            .
          </p>
        </div>

        <div className="flex gap-3 w-full sm:w-auto shrink-0">
          <button
            onClick={() => decide("declined")}
            className="flex-1 sm:flex-none border border-gray-200 text-gray-600 font-semibold px-5 py-2.5 rounded-xl hover:bg-gray-50 transition-colors text-sm"
          >
            Essential only
          </button>
          <button
            onClick={() => decide("accepted")}
            className="flex-1 sm:flex-none bg-blue-600 text-white font-semibold px-5 py-2.5 rounded-xl hover:bg-blue-700 transition-colors text-sm"
          >
            Accept all
          </button>
        </div>
      </div>
    </div>
  );
}
