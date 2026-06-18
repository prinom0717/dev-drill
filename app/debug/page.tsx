"use client";

import { useEffect, useState } from "react";

export default function DebugButton() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkDevice = () => {
      const mobile =
        ("ontouchstart" in window) ||
        navigator.maxTouchPoints > 0;

      setIsMobile(mobile);
    };

    checkDevice();
    const timer = setTimeout(checkDevice, 300);
    return () => clearTimeout(timer);
  }, []);

  async function sendLog(s: string) {
    await fetch("/api/log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: `${s} からタップされた`,
        time: new Date().toISOString(),
      }),
    });
  }

  return (
    <>
      <button
        onTouchStart={() => sendLog("test")}
        onClick={() => sendLog("test")}
        className="cursor-pointer p-4 bg-slate-200 block"
      >
        テスト（test）
      </button>

      <br />

      <button
        onClick={() => sendLog(isMobile ? "mobile" : "pc")}
        onTouchStart={() => isMobile && sendLog("mobile")}
        className="cursor-pointer p-4 bg-slate-200 block"
      >
        テスト（端末判定） → {isMobile ? "mobile" : "pc"}
      </button>
      <button
  onTouchStart={() => sendLog("safari")}
  onClick={() => sendLog("safari")}
  className="cursor-pointer block w-full p-4 bg-white border border-slate-300 rounded-xl"
  style={{ WebkitAppearance: "none" }}
>
  Safariでも押せるボタン（sendLog）
</button>

    </>
  );
}
