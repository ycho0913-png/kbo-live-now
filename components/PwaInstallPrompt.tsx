"use client";

import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

function isIos() {
  if (typeof window === "undefined") return false;
  return /iphone|ipad|ipod/i.test(window.navigator.userAgent);
}

function isStandalone() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(display-mode: standalone)").matches || (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
}

export default function PwaInstallPrompt() {
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [showIosHelp, setShowIosHelp] = useState(false);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => undefined);
    }

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallEvent(event as BeforeInstallPromptEvent);
      setHidden(false);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    setShowIosHelp(isIos() && !isStandalone());

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  if (hidden || isStandalone() || (!installEvent && !showIosHelp)) return null;

  const handleInstall = async () => {
    if (!installEvent) {
      setShowIosHelp(true);
      return;
    }

    await installEvent.prompt();
    await installEvent.userChoice.catch(() => null);
    setInstallEvent(null);
    setHidden(true);
  };

  return (
    <div className="fixed bottom-20 left-1/2 z-40 w-[min(92vw,460px)] -translate-x-1/2 rounded-lg border border-[#0b4ea2]/20 bg-white p-3 text-ink shadow-soft sm:bottom-24">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-[#0b4ea2] text-lg font-black text-white">
          K
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-black">휴대폰 홈 화면에 앱 버튼 만들기</p>
          <p className="mt-1 text-xs font-semibold leading-relaxed text-ink/60">
            {showIosHelp
              ? "아이폰은 공유 버튼을 누른 뒤 '홈 화면에 추가'를 선택하면 됩니다."
              : "설치하면 카톡처럼 홈 화면에서 바로 열 수 있습니다."}
          </p>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={handleInstall}
              className="rounded-md bg-[#ff6b00] px-3 py-2 text-xs font-black text-white"
            >
              앱 버튼 만들기
            </button>
            <button
              type="button"
              onClick={() => setHidden(true)}
              className="rounded-md bg-[#f1f5f9] px-3 py-2 text-xs font-black text-ink/65"
            >
              나중에
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
