import { useEffect, useState, useRef, type RefObject } from 'react';

export function useScrollSpy(
  scrollContainerRef: RefObject<HTMLElement | null>,
  sectionSelector = '[id^="section-"]',
) {
  const [activeSection, setActiveSection] = useState<string>('');
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    observerRef.current?.disconnect();

    observerRef.current = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && entry.target.id) {
            setActiveSection(entry.target.id);
          }
        }
      },
      { root: container, rootMargin: '-10% 0px -80% 0px', threshold: 0 },
    );

    const sections = container.querySelectorAll(sectionSelector);
    sections.forEach((el) => observerRef.current!.observe(el));

    return () => observerRef.current?.disconnect();
  }, [scrollContainerRef, sectionSelector]);

  return activeSection;
}
