import { BookOpen, CheckCircle2, Home, Menu, X } from 'lucide-react';
import { useState, type CSSProperties } from 'react';
import { Link, NavLink, Outlet, ScrollRestoration } from 'react-router-dom';
import { COURSE } from '@/course/course.config';
import { COURSE_MODULES } from '@/course/modules';
import { useCourseProgress } from '@/hooks/useCourseProgress';
import { ThemeToggle } from './ThemeToggle';

export function AppShell() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { completedSlugs } = useCourseProgress();
  const theme = {
    '--course-primary': COURSE.theme.primary,
    '--course-accent': COURSE.theme.accent,
    '--course-light-background': COURSE.theme.light.background,
    '--course-light-surface': COURSE.theme.light.surface,
    '--course-light-surface-soft': COURSE.theme.light.surfaceSoft,
    '--course-light-surface-muted': COURSE.theme.light.surfaceMuted,
    '--course-light-text': COURSE.theme.light.text,
    '--course-light-body-copy': COURSE.theme.light.bodyCopy,
    '--course-light-muted-text': COURSE.theme.light.mutedText,
    '--course-light-line': COURSE.theme.light.line,
    '--course-light-accent-text': COURSE.theme.light.accentText,
    '--course-dark-background': COURSE.theme.dark.background,
    '--course-dark-surface': COURSE.theme.dark.surface,
    '--course-dark-surface-soft': COURSE.theme.dark.surfaceSoft,
    '--course-dark-surface-muted': COURSE.theme.dark.surfaceMuted,
    '--course-dark-text': COURSE.theme.dark.text,
    '--course-dark-body-copy': COURSE.theme.dark.bodyCopy,
    '--course-dark-muted-text': COURSE.theme.dark.mutedText,
    '--course-dark-line': COURSE.theme.dark.line,
    '--course-dark-accent-text': COURSE.theme.dark.accentText,
    '--course-body-font': COURSE.theme.typography.body,
    '--course-heading-font': COURSE.theme.typography.heading,
  } as CSSProperties;

  return (
    <div className="app-shell" data-geometry={COURSE.theme.geometry} style={theme}>
      <header className="topbar">
        <Link className="brand" to="/" onClick={() => setMenuOpen(false)}>
          <span className="brand-mark"><BookOpen size={20} /></span>
          <span><strong>{COURSE.shortTitle}</strong><small>{COURSE.code}</small></span>
        </Link>
        <div className="topbar-actions">
          <div className="topbar-meta"><span>{COURSE.institution}</span><span>{COURSE.term}</span></div>
          <ThemeToggle />
          <button className="mobile-menu" aria-expanded={menuOpen} aria-label="Toggle course navigation" onClick={() => setMenuOpen((value) => !value)}>
            {menuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </header>

      <div className="shell-body">
        <aside className={`sidebar ${menuOpen ? 'is-open' : ''}`}>
          <nav aria-label="Course navigation">
            <NavLink className={({ isActive }) => `nav-item nav-home ${isActive ? 'is-active' : ''}`} to="/" end onClick={() => setMenuOpen(false)}>
              <Home size={17} /> Course overview
            </NavLink>
            <p className="nav-label">Course path</p>
            {COURSE_MODULES.map((module) => (
              <NavLink
                className={({ isActive }) => `nav-item ${isActive ? 'is-active' : ''}`}
                key={module.slug}
                to={`/modules/${module.slug}`}
                onClick={() => setMenuOpen(false)}
              >
                <span className="nav-number">{String(module.number).padStart(2, '0')}</span>
                <span>{module.title}</span>
                {completedSlugs.includes(module.slug) && <CheckCircle2 className="nav-check" size={16} aria-label="Completed" />}
              </NavLink>
            ))}
          </nav>
          <div className="sidebar-note">
            <strong>For students</strong>
            <p>Your progress is saved only in this browser.</p>
          </div>
        </aside>
        {menuOpen && <button className="menu-scrim" aria-label="Close navigation" onClick={() => setMenuOpen(false)} />}

        <main className="main-content"><Outlet /></main>
      </div>
      <ScrollRestoration />
    </div>
  );
}
