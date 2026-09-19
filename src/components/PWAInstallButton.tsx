import React, { useState } from 'react';
import { Download, Smartphone, X } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already installed, hide prompt
  if (isInstalled) {
    return null;
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <button
        id="pwa-install-btn"
        onClick={install}
        className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-3.5 py-2 text-xs md:text-sm font-bold text-slate-950 shadow-[0_3px_0_#92400e] hover:brightness-105 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer border-2 border-amber-900"
      >
        <Download className="w-4 h-4 text-slate-950 stroke-[2.5]" />
        <span>Install App</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          id="pwa-install-ios-btn"
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center gap-2 rounded-xl bg-amber-500/20 border-2 border-amber-500/40 px-3 py-1.5 text-xs font-bold text-amber-300 hover:bg-amber-500/30 transition-all cursor-pointer"
        >
          <Smartphone className="w-4 h-4 text-amber-400" />
          <span>Install on iOS</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
            <div className="w-full max-w-sm rounded-2xl bg-slate-900 border-3 border-amber-500 p-6 shadow-2xl text-slate-100 relative animate-in fade-in zoom-in duration-200">
              <button
                onClick={() => setShowIOSGuide(false)}
                className="absolute top-3 right-3 p-1.5 rounded-lg text-slate-400 hover:text-white bg-slate-800"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black text-xl border-2 border-amber-900">
                  🍺
                </div>
                <div>
                  <h3 className="text-base font-black text-amber-400">Install Pub Quiz</h3>
                  <p className="text-xs text-slate-400">Add to iPhone or iPad Home Screen</p>
                </div>
              </div>
              <div className="mt-4 space-y-2.5 text-xs text-slate-300 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
                <p className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-amber-500/30 text-amber-400 font-bold flex items-center justify-center text-xs">1</span>
                  Tap the <strong className="text-white">Share</strong> button in Safari's toolbar.
                </p>
                <p className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-amber-500/30 text-amber-400 font-bold flex items-center justify-center text-xs">2</span>
                  Scroll down and tap <strong className="text-white">Add to Home Screen</strong>.
                </p>
                <p className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-amber-500/30 text-amber-400 font-bold flex items-center justify-center text-xs">3</span>
                  Enjoy full-screen, offline-ready pub quizzes!
                </p>
              </div>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-5 w-full rounded-xl bg-amber-500 py-2.5 text-xs font-black text-slate-950 hover:bg-amber-400 transition"
              >
                Got It!
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
