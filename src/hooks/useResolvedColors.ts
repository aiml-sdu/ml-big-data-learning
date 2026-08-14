import { useSyncExternalStore } from 'react';

/**
 * Resolve CSS custom properties to actual color strings for use in inline styles
 * (e.g. ReactFlow edges) where `hsl(var(--border))` doesn't work.
 */

export interface ResolvedColors {
  border: string;
  mutedForeground: string;
  muted: string;
  card: string;
  foreground: string;
  primary: string;
}

let cachedColors: ResolvedColors | null = null;
let darkSnapshot = document.documentElement.classList.contains('dark');

function getSnapshot(): ResolvedColors {
  const isDark = document.documentElement.classList.contains('dark');
  if (cachedColors && isDark === darkSnapshot) return cachedColors;
  darkSnapshot = isDark;
  cachedColors = resolve();
  return cachedColors;
}

function subscribe(cb: () => void) {
  const observer = new MutationObserver(() => {
    cachedColors = null;
    cb();
  });
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class'],
  });
  return () => observer.disconnect();
}

function resolve(): ResolvedColors {
  const style = getComputedStyle(document.documentElement);
  const get = (prop: string, fallback: string) => {
    const raw = style.getPropertyValue(prop).trim();
    if (!raw) return fallback;
    // Resolve oklch or other non-standard color functions via temp element
    if (raw.startsWith('oklch(')) {
      const el = document.createElement('div');
      el.style.color = raw;
      document.body.appendChild(el);
      const resolved = getComputedStyle(el).color;
      document.body.removeChild(el);
      return resolved || fallback;
    }
    return raw;
  };

  return {
    border: get('--border', '#e5e7eb'),
    mutedForeground: get('--muted-foreground', '#6b7280'),
    muted: get('--muted', '#f3f4f6'),
    card: get('--card', '#ffffff'),
    foreground: get('--foreground', '#111827'),
    primary: get('--primary', '#4f46e5'),
  };
}

export function useResolvedColors() {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
