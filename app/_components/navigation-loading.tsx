"use client";

import { useRouter } from "next/navigation";
import { CircularProgress, Box } from "@mui/material";
import { useEffect, useState } from "react";

export function NavigationLoading() {
  const router = useRouter();
  const [isNavigating, setIsNavigating] = useState(false);

  useEffect(() => {
    // ページ遷移の開始と終了を監視
    const handleStart = () => setIsNavigating(true);
    const handleComplete = () => setIsNavigating(false);

    // Next.js 16ではrouter.eventsが直接利用できないため、
    // windowのイベントとuseRouterの状態を組み合わせて監視
    let isNavigatingLocal = false;

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a');
      
      if (link && link.href && link.href !== window.location.href) {
        // 同一ドメイン内のリンクかチェック
        try {
          const url = new URL(link.href);
          if (url.origin === window.location.origin) {
            isNavigatingLocal = true;
            handleStart();
            
            // タイムアウト処理（遷移が完了しない場合の安全策）
            setTimeout(() => {
              if (isNavigatingLocal) {
                isNavigatingLocal = false;
                handleComplete();
              }
            }, 5000);
          }
        } catch (err) {
          // URL解析エラーは無視
        }
      }
    };

    const handlePopState = () => {
      isNavigatingLocal = true;
      handleStart();
      setTimeout(() => {
        isNavigatingLocal = false;
        handleComplete();
      }, 500);
    };

    document.addEventListener('click', handleClick);
    window.addEventListener('popstate', handlePopState);

    // ページ読み込み完了時にローディングを解除
    if (document.readyState === 'complete') {
      handleComplete();
    } else {
      window.addEventListener('load', handleComplete);
    }

    return () => {
      document.removeEventListener('click', handleClick);
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('load', handleComplete);
    };
  }, []);

  if (!isNavigating) return null;

  return (
    <Box 
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        bgcolor: "rgba(255,255,255,0.9)",
        zIndex: 9999,
      }}
    >
      <CircularProgress size={60} />
    </Box>
  );
}
