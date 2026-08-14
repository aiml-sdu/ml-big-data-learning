import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import 'katex/dist/katex.min.css';
import './globals.css';
import PilotApp from './PilotApp';

const stored = localStorage.getItem('mlbd-theme');
if (stored === 'dark' || (!stored && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
  document.documentElement.classList.add('dark');
}

createRoot(document.getElementById('app')!).render(<StrictMode><PilotApp /></StrictMode>);
