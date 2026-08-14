import { useMemo, type ReactNode } from 'react';
import katex from 'katex';

interface AlgorithmBoxProps {
  number?: number;
  title: string;
  children: string;
}

const KEYWORDS = new Set([
  'function', 'if', 'then', 'else', 'return', 'while', 'for',
  'loop', 'do', 'repeat', 'until', 'end', 'and', 'or', 'not',
]);

function boldKeywords(text: string): ReactNode[] {
  const tokens = text.split(/(\b\w+\b)/g);
  return tokens.map((tok, i) =>
    KEYWORDS.has(tok.toLowerCase()) ? <strong key={i}>{tok}</strong> : tok,
  );
}

function renderSegment(text: string): ReactNode[] {
  // First pass: extract $...$ for KaTeX, leaving text segments for keyword bolding
  const parts: ReactNode[] = [];
  const regex = /\$([^$]+)\$/g;
  let last = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > last) {
      parts.push(...boldKeywords(text.slice(last, match.index)));
    }
    const html = katex.renderToString(match[1], { throwOnError: false });
    parts.push(<span key={`k${match.index}`} dangerouslySetInnerHTML={{ __html: html }} />);
    last = regex.lastIndex;
  }

  if (last < text.length) {
    parts.push(...boldKeywords(text.slice(last)));
  }
  return parts;
}

function renderLine(line: string, key: number): ReactNode {
  const commentIdx = line.indexOf('//');
  const code = commentIdx >= 0 ? line.slice(0, commentIdx) : line;
  const comment = commentIdx >= 0 ? line.slice(commentIdx) : '';

  return (
    <span key={key}>
      {renderSegment(code)}
      {comment && <em className="text-muted-foreground">{renderSegment(comment)}</em>}
    </span>
  );
}

export default function AlgorithmBox({ number, title, children }: AlgorithmBoxProps) {
  const lines = useMemo(() => children.split('\n'), [children]);

  return (
    <div className="my-6 overflow-hidden rounded-lg border bg-card shadow-sm">
      {/* Title bar */}
      <div className="bg-primary px-4 py-2 text-primary-foreground">
        <span className="font-semibold">
          {number != null && <>Algorithm {number}: </>}
          {title}
        </span>
      </div>

      {/* Code body */}
      <div className="overflow-x-auto p-4">
        <table className="w-full border-collapse font-mono text-sm leading-relaxed">
          <tbody>
            {lines.map((line, i) => (
              <tr key={i}>
                <td className="w-8 select-none pr-3 text-right align-top text-muted-foreground/50 text-xs">
                  {i + 1}
                </td>
                <td className="whitespace-pre">{renderLine(line, i)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
