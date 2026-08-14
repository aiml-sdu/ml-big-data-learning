import { useState, useCallback } from 'react';
import { Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HighlightRule {
  pattern: RegExp;
  className: string;
}

const COMMON_RULES: HighlightRule[] = [
  { pattern: /(\/\/.*$|#.*$)/gm, className: 'code-comment' },
  { pattern: /(\/\*[\s\S]*?\*\/)/g, className: 'code-comment' },
  { pattern: /("""[\s\S]*?"""|'''[\s\S]*?''')/g, className: 'code-string' },
  { pattern: /("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`)/g, className: 'code-string' },
  { pattern: /\b(\d+(?:\.\d+)?(?:e[+-]?\d+)?)\b/gi, className: 'code-number' },
];

const KEYWORD_MAP: Record<string, string[]> = {
  python: ['def', 'class', 'import', 'from', 'return', 'if', 'elif', 'else', 'for', 'while', 'in', 'not', 'and', 'or', 'is', 'with', 'as', 'try', 'except', 'finally', 'raise', 'yield', 'lambda', 'pass', 'break', 'continue', 'True', 'False', 'None', 'self', 'async', 'await', 'print'],
  typescript: ['const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while', 'class', 'extends', 'implements', 'interface', 'type', 'import', 'export', 'from', 'new', 'this', 'super', 'async', 'await', 'try', 'catch', 'finally', 'throw', 'true', 'false', 'null', 'undefined', 'void', 'typeof', 'instanceof', 'of', 'in', 'switch', 'case', 'default', 'break', 'continue', 'enum', 'abstract', 'readonly', 'private', 'public', 'protected', 'static'],
  javascript: ['const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while', 'class', 'extends', 'import', 'export', 'from', 'new', 'this', 'super', 'async', 'await', 'try', 'catch', 'finally', 'throw', 'true', 'false', 'null', 'undefined', 'void', 'typeof', 'instanceof', 'of', 'in', 'switch', 'case', 'default', 'break', 'continue'],
  pseudocode: ['function', 'procedure', 'if', 'then', 'else', 'end', 'while', 'do', 'for', 'each', 'return', 'repeat', 'until', 'loop', 'begin', 'end', 'and', 'or', 'not', 'true', 'false', 'null', 'nil', 'input', 'output', 'print', 'set', 'to'],
};

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function highlightCode(code: string, lang: string): string {
  const placeholders: string[] = [];
  let text = escapeHtml(code);

  function replace(rules: HighlightRule[]) {
    for (const rule of rules) {
      text = text.replace(rule.pattern, (match) => {
        const idx = placeholders.length;
        placeholders.push(`<span class="${rule.className}">${match}</span>`);
        return `\x00${idx}\x00`;
      });
    }
  }

  replace(COMMON_RULES);

  const kws = KEYWORD_MAP[lang] ?? KEYWORD_MAP[lang.toLowerCase()];
  if (kws) {
    const escaped = kws.map((k) => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    replace([{ pattern: new RegExp(`\\b(${escaped.join('|')})\\b`, 'g'), className: 'code-keyword' }]);
  }

  text = text.replace(/\x00(\d+)\x00/g, (_, idx) => placeholders[Number(idx)]);
  return text;
}

interface CodeBlockProps {
  language?: string;
  code: string;
}

export default function CodeBlock({ language = '', code }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const highlighted = highlightCode(code.trim(), language);
  const lines = highlighted.split('\n');

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code.trim());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* noop */ }
  }, [code]);

  return (
    <div className="my-4 rounded-lg border bg-muted/30 overflow-hidden">
      <div className="flex items-center justify-between border-b bg-muted/50 px-4 py-2">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{language}</span>
        <Button variant="ghost" size="sm" className="h-7 gap-1.5 text-xs" onClick={handleCopy}>
          {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
          {copied ? 'Copied!' : 'Copy'}
        </Button>
      </div>
      <div className="flex overflow-x-auto">
        <div className="select-none py-3 pl-4 pr-3 text-right" aria-hidden="true">
          {lines.map((_, i) => (
            <div key={i} className="text-xs leading-6 text-muted-foreground/50 font-mono">{i + 1}</div>
          ))}
        </div>
        <pre className="flex-1 py-3 pr-4 overflow-x-auto">
          <code
            className="text-sm leading-6 font-mono"
            dangerouslySetInnerHTML={{
              __html: lines.map((line) => `<span>${line || ' '}</span>`).join('\n'),
            }}
          />
        </pre>
      </div>
    </div>
  );
}
