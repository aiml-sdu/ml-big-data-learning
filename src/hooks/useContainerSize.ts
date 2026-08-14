import { useEffect, useRef, useState } from 'react';

export interface ContainerSize {
  width: number;
  height: number;
}

/**
 * ResizeObserver-based hook that tracks a container's dimensions.
 * Returns { width, height } in CSS pixels (not device pixels).
 */
export function useContainerSize(
  ref: React.RefObject<HTMLElement | null>,
  fallback: ContainerSize = { width: 700, height: 460 },
): ContainerSize {
  const [size, setSize] = useState<ContainerSize>(fallback);
  const rafRef = useRef(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new ResizeObserver((entries) => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        const entry = entries[0];
        if (!entry) return;
        const { width, height } = entry.contentRect;
        setSize((prev) => {
          if (Math.abs(prev.width - width) < 1 && Math.abs(prev.height - height) < 1) return prev;
          return { width: Math.floor(width), height: Math.floor(height) };
        });
      });
    });

    observer.observe(el);
    return () => {
      cancelAnimationFrame(rafRef.current);
      observer.disconnect();
    };
  }, [ref]);

  return size;
}
