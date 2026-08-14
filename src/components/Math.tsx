import { useMemo } from 'react';
import katex from 'katex';

interface MathProps {
  children: string;
}

export function M({ children }: MathProps) {
  const html = useMemo(
    () => katex.renderToString(children, { throwOnError: false }),
    [children],
  );
  return <span dangerouslySetInnerHTML={{ __html: html }} />;
}

export function BlockMath({ children }: MathProps) {
  const html = useMemo(
    () => katex.renderToString(children, { throwOnError: false, displayMode: true }),
    [children],
  );
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}

/**
 * Renders a string containing inline LaTeX delimited by `$...$`.
 * Non-math text is rendered as-is; math segments are rendered via KaTeX.
 */
export function MathText({ children }: MathProps) {
  const html = useMemo(() => {
    // Split on $...$ but keep the delimiters for identification
    const parts = children.split(/(\$[^$]+\$)/g);
    return parts
      .map((part) => {
        if (part.startsWith('$') && part.endsWith('$') && part.length > 2) {
          const tex = part.slice(1, -1);
          try {
            return katex.renderToString(tex, { throwOnError: false });
          } catch {
            return part;
          }
        }
        // Escape HTML in text segments
        return part.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      })
      .join('');
  }, [children]);
  return <span dangerouslySetInnerHTML={{ __html: html }} />;
}
