import { useRef, useEffect, useMemo } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import SideNav from '../components/SideNav.tsx';
import TopBar from '../components/TopBar.tsx';
import ProgressBar from '../components/ProgressBar.tsx';
import ContentOutline from '../components/ContentOutline.tsx';
import { useTheme } from '../hooks/useTheme.ts';
import { useScrollSpy } from '../hooks/useScrollSpy.ts';
import { useSectionProgress } from '../hooks/useSectionProgress.ts';
import { useActiveLessonSection, clearActiveLessonSection } from '../hooks/useActiveLessonSection.ts';
import { NAV_TOPICS } from '../data/nav-topics.ts';

export default function AppShell() {
  const mainRef = useRef<HTMLElement>(null);
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  // Extract active topic from pathname: "/topic-01" -> "topic-01"
  const activeTopic = location.pathname.slice(1) || 'welcome';
  const scrollSpySection = useScrollSpy(mainRef);
  const stepperSection = useActiveLessonSection();

  // Clear stale stepper section when topic changes (stepper will re-set on mount)
  useEffect(() => {
    clearActiveLessonSection();
  }, [activeTopic]);

  // Stepper pages report via useActiveLessonSection; scroll spy works for legacy scroll pages
  const activeSection = stepperSection || scrollSpySection;

  // Get section IDs for current topic
  const sectionIds = useMemo(() => {
    const topic = NAV_TOPICS.find((t) => t.id === activeTopic);
    return topic?.sections.map((s) => s.id) ?? [];
  }, [activeTopic]);

  const { visitedSections, markVisited } = useSectionProgress(activeTopic, sectionIds);

  // Auto-mark section as visited when scroll spy reports it active
  useEffect(() => {
    if (activeSection) {
      markVisited(activeSection);
    }
  }, [activeSection, markVisited]);

  // Scroll to section on hash change
  useEffect(() => {
    const hash = location.hash.slice(1); // remove #
    if (hash) {
      requestAnimationFrame(() => {
        const el = document.getElementById(hash);
        el?.scrollIntoView({ behavior: 'smooth' });
      });
    } else {
      mainRef.current?.scrollTo(0, 0);
    }
  }, [location]);

  return (
    <SidebarProvider>
      <SideNav
        activeTopic={activeTopic}
        activeSection={activeSection}
      />
      <SidebarInset>
        <TopBar
          theme={theme}
          onThemeToggle={toggleTheme}
        />
        <ProgressBar scrollContainerRef={mainRef} />
        <main
          className="flex-1 overflow-y-auto p-6 lg:p-8"
          ref={mainRef}
        >
          <div className="mx-auto max-w-[800px] xl:max-w-[1060px] xl:flex xl:gap-8">
            <div className="flex-1 min-w-0 max-w-[800px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTopic}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.2 }}
                >
                  <Outlet />
                </motion.div>
              </AnimatePresence>
            </div>
            {/* Outer div stretches to flex parent height; inner sticky sticks within it */}
            <div className="hidden xl:block w-44 shrink-0">
              <ContentOutline
                topicId={activeTopic}
                activeSection={activeSection}
                visitedSections={visitedSections}
              />
            </div>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
