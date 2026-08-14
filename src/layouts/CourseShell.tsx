import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { BarChart3, BookOpen, Database, Menu, Moon, Sun, X } from 'lucide-react';

const lessons = [
  { to: '/lecture-1', number: '01', title: 'Thinking at Data Scale', icon: BarChart3 },
  { to: '/lecture-2', number: '02', title: 'From Messy Data to Signal', icon: Database },
];

export default function CourseShell() {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'));
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' }); setMenuOpen(false); }, [location.pathname]);
  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem('mlbd-theme', next ? 'dark' : 'light');
  };
  return <div className="min-h-screen bg-background text-foreground">
    <header className="sticky top-0 z-50 border-b bg-background/90 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6">
        <Link to="/welcome" className="flex min-w-0 items-center gap-3 no-underline">
          <span className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground shadow-sm"><BookOpen className="size-5" /></span>
          <span className="min-w-0"><span className="block truncate text-sm font-bold tracking-tight">ML & Big Data Lab</span><span className="block text-[11px] text-muted-foreground">SDU ? 2026 pilot</span></span>
        </Link>
        <nav className="ml-auto hidden items-center gap-1 md:flex" aria-label="Course navigation">
          {lessons.map((lesson) => <NavLink key={lesson.to} to={lesson.to} className={({ isActive }) => `rounded-lg px-3 py-2 text-sm font-medium no-underline transition-colors ${isActive ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}>Lecture {lesson.number}</NavLink>)}
        </nav>
        <button onClick={toggleTheme} className="ml-auto grid size-10 place-items-center rounded-lg hover:bg-muted md:ml-0" aria-label={dark ? 'Use light theme' : 'Use dark theme'}>{dark ? <Sun className="size-5" /> : <Moon className="size-5" />}</button>
        <button onClick={() => setMenuOpen(!menuOpen)} className="grid size-10 place-items-center rounded-lg hover:bg-muted md:hidden" aria-label="Toggle course menu">{menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}</button>
      </div>
      {menuOpen && <nav className="border-t p-3 md:hidden" aria-label="Mobile course navigation">
        {lessons.map((lesson) => <NavLink key={lesson.to} to={lesson.to} className="flex items-center gap-3 rounded-xl p-3 text-sm font-medium no-underline hover:bg-muted"><lesson.icon className="size-4 text-primary" /> Lecture {lesson.number}: {lesson.title}</NavLink>)}
      </nav>}
    </header>
    <main><Outlet /></main>
    <footer className="border-t py-8 text-center text-sm text-muted-foreground">Machine Learning and Big Data Analytics ? formative learning pilot</footer>
  </div>;
}
