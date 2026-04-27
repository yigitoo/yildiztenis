"use client";

import { useEffect, useRef, useState } from "react";
import { RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";

export function PullToRefresh() {
  const router = useRouter();
  const [pulling, setPulling] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const startY = useRef(0);
  const pullDistance = useRef(0);
  const indicatorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const threshold = 80;
    let scrollContainer: HTMLElement | null = null;

    function getScrollContainer() {
      if (!scrollContainer) {
        scrollContainer = document.querySelector("main");
      }
      return scrollContainer;
    }

    function onTouchStart(e: TouchEvent) {
      const container = getScrollContainer();
      if (!container || container.scrollTop > 0) return;
      startY.current = e.touches[0].clientY;
      pullDistance.current = 0;
    }

    function onTouchMove(e: TouchEvent) {
      const container = getScrollContainer();
      if (!container || container.scrollTop > 0 || startY.current === 0) return;

      const dy = e.touches[0].clientY - startY.current;
      if (dy < 0) return;

      pullDistance.current = Math.min(dy, 120);
      setPulling(true);

      if (indicatorRef.current) {
        const progress = Math.min(pullDistance.current / threshold, 1);
        indicatorRef.current.style.opacity = String(progress);
        indicatorRef.current.style.transform = `translateY(${pullDistance.current * 0.4}px) rotate(${progress * 180}deg)`;
      }
    }

    function onTouchEnd() {
      if (pullDistance.current >= threshold && !refreshing) {
        setRefreshing(true);
        router.refresh();
        setTimeout(() => {
          setRefreshing(false);
          setPulling(false);
        }, 1000);
      } else {
        setPulling(false);
      }
      startY.current = 0;
      pullDistance.current = 0;
      if (indicatorRef.current) {
        indicatorRef.current.style.opacity = "0";
        indicatorRef.current.style.transform = "translateY(0)";
      }
    }

    document.addEventListener("touchstart", onTouchStart, { passive: true });
    document.addEventListener("touchmove", onTouchMove, { passive: true });
    document.addEventListener("touchend", onTouchEnd);

    return () => {
      document.removeEventListener("touchstart", onTouchStart);
      document.removeEventListener("touchmove", onTouchMove);
      document.removeEventListener("touchend", onTouchEnd);
    };
  }, [refreshing, router]);

  return (
    <div
      ref={indicatorRef}
      className="pointer-events-none fixed top-16 left-1/2 z-50 -translate-x-1/2 opacity-0 transition-opacity lg:hidden"
    >
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-card shadow-md ring-1 ring-border">
        <RefreshCw size={14} className={refreshing ? "animate-spin text-primary" : "text-muted-foreground"} />
      </div>
    </div>
  );
}
