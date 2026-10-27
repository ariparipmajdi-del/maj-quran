import { useState, useRef, useEffect, useCallback } from 'react';

export function useAutoScroll() {
  const [isScrolling, setIsScrolling] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [speed, setSpeed] = useState<number>(2); // 1 = slow, 2 = normal, 3 = fast, 4 = faster

  const animFrameId = useRef<number | null>(null);
  const lastTimestamp = useRef<number | null>(null);
  const speedRef = useRef<number>(speed);
  speedRef.current = speed;

  const stop = useCallback(() => {
    if (animFrameId.current !== null) {
      cancelAnimationFrame(animFrameId.current);
      animFrameId.current = null;
    }
    lastTimestamp.current = null;
    setIsScrolling(false);
    setIsPaused(false);
  }, []);

  const pause = useCallback(() => {
    if (animFrameId.current !== null) {
      cancelAnimationFrame(animFrameId.current);
      animFrameId.current = null;
    }
    lastTimestamp.current = null;
    setIsPaused(true);
  }, []);

  const scrollStep = useCallback((timestamp: number) => {
    if (lastTimestamp.current === null) {
      lastTimestamp.current = timestamp;
    }

    const delta = timestamp - lastTimestamp.current;
    lastTimestamp.current = timestamp;

    // Speed formula: px per second = speed * 25
    // so at speed 2, ~50px/sec
    const pxToScroll = (speedRef.current * 25 * delta) / 1000;

    // Check if reached bottom of document
    const scrollMax = document.documentElement.scrollHeight - window.innerHeight;
    if (window.scrollY + pxToScroll >= scrollMax) {
      window.scrollBy({ top: scrollMax - window.scrollY, behavior: 'auto' });
      stop();
      return;
    }

    window.scrollBy({ top: pxToScroll, behavior: 'auto' });
    animFrameId.current = requestAnimationFrame(scrollStep);
  }, [stop]);

  const start = useCallback(() => {
    // Check prefers-reduced-motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      console.info('Auto-scroll respects reduced motion preference.');
      return;
    }

    if (animFrameId.current !== null) {
      cancelAnimationFrame(animFrameId.current);
    }

    lastTimestamp.current = null;
    setIsScrolling(true);
    setIsPaused(false);
    animFrameId.current = requestAnimationFrame(scrollStep);
  }, [scrollStep]);

  const resume = useCallback(() => {
    if (!isPaused) return;
    lastTimestamp.current = null;
    setIsPaused(false);
    animFrameId.current = requestAnimationFrame(scrollStep);
  }, [isPaused, scrollStep]);

  // Clean up on component unmount
  useEffect(() => {
    return () => {
      if (animFrameId.current !== null) {
        cancelAnimationFrame(animFrameId.current);
      }
    };
  }, []);

  return {
    isScrolling,
    isPaused,
    speed,
    setSpeed,
    start,
    pause,
    resume,
    stop,
  };
}
