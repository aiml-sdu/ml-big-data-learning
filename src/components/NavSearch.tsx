import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { NAV_TOPICS } from '../data/nav-topics.ts';
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from '@/components/ui/command';
import { Button } from '@/components/ui/button';

interface SearchResult {
  label: string;
  topicId: string;
  sectionId?: string;
}

function fuzzyMatch(query: string, target: string): boolean {
  let qi = 0;
  for (let ti = 0; ti < target.length && qi < query.length; ti++) {
    if (target[ti] === query[qi]) qi++;
  }
  return qi === query.length;
}

function buildResults(query: string): SearchResult[] {
  const results: SearchResult[] = [];
  const q = query.toLowerCase().trim();
  for (const topic of NAV_TOPICS) {
    const topicLabel = topic.number > 0 ? `${topic.number}. ${topic.title}` : topic.title;
    if (!q || fuzzyMatch(q, topicLabel.toLowerCase())) {
      results.push({ label: topicLabel, topicId: topic.id });
    }
    for (const section of topic.sections) {
      const sectionLabel = `${section.number} ${section.title}`;
      if (!q || fuzzyMatch(q, sectionLabel.toLowerCase())) {
        results.push({ label: sectionLabel, topicId: topic.id, sectionId: section.id });
      }
    }
  }
  return results;
}

export default function NavSearch() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const isMac = navigator.platform.includes('Mac');

  // Global Cmd+K
  useEffect(() => {
    const onKeydown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen(true);
      }
    };
    document.addEventListener('keydown', onKeydown);
    return () => document.removeEventListener('keydown', onKeydown);
  }, []);

  const selectResult = useCallback((r: SearchResult) => {
    if (r.sectionId) {
      navigate({ pathname: `/${r.topicId}`, hash: `#${r.sectionId}` });
    } else {
      navigate(`/${r.topicId}`);
    }
    setOpen(false);
  }, [navigate]);

  const results = buildResults('');

  return (
    <>
      <Button
        variant="outline"
        className="relative h-9 w-9 justify-center rounded-md text-sm text-muted-foreground lg:w-56 lg:justify-start"
        onClick={() => setOpen(true)}
        aria-label="Search topics and sections"
      >
        <Search className="size-4 lg:mr-2" />
        <span className="hidden lg:inline">Search...</span>
        <kbd className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 hidden lg:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
          {isMac ? '\u2318' : 'Ctrl+'}K
        </kbd>
      </Button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Search topics and sections..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Topics & Sections">
            {results.map((r) => (
              <CommandItem
                key={`${r.topicId}/${r.sectionId ?? ''}`}
                onSelect={() => selectResult(r)}
              >
                {r.label}
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
