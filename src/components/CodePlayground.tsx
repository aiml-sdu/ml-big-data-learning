import { useState, useCallback, useRef } from 'react';
import { Play, Check, X, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import HintPanel, { type HintLevel } from './HintPanel';

export interface TestCase {
  label: string;
  call: string; // JS expression to evaluate
  expected: string; // JSON string of expected result
}

interface CodePlaygroundProps {
  templateCode: string;
  testCases: TestCase[];
  hints?: HintLevel[];
  onAllPass?: () => void;
}

interface TestResult {
  label: string;
  passed: boolean;
  expected: string;
  actual: string;
}

export default function CodePlayground({
  templateCode,
  testCases,
  hints,
  onAllPass,
}: CodePlaygroundProps) {
  const [code, setCode] = useState(templateCode);
  const [results, setResults] = useState<TestResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [failCount, setFailCount] = useState(0);
  const [allPassed, setAllPassed] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleRun = useCallback(() => {
    setError(null);
    const newResults: TestResult[] = [];

    try {
      // Evaluate student code + test cases with timeout
      for (const tc of testCases) {
        try {
          const fullCode = `${code}\n;(${tc.call})`;
          const fn = new Function(fullCode);

          let result: unknown;
          const start = performance.now();
          result = fn();
          const elapsed = performance.now() - start;

          if (elapsed > 3000) {
            throw new Error('Timeout: code took too long to execute');
          }

          const actual = JSON.stringify(result);
          newResults.push({
            label: tc.label,
            passed: actual === tc.expected,
            expected: tc.expected,
            actual: actual ?? 'undefined',
          });
        } catch (e) {
          newResults.push({
            label: tc.label,
            passed: false,
            expected: tc.expected,
            actual: e instanceof Error ? e.message : String(e),
          });
        }
      }

      setResults(newResults);

      const passed = newResults.every((r) => r.passed);
      if (passed) {
        setAllPassed(true);
        onAllPass?.();
      } else {
        setFailCount((c) => c + 1);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }, [code, testCases, onAllPass]);

  const handleReset = useCallback(() => {
    setCode(templateCode);
    setResults([]);
    setError(null);
    setAllPassed(false);
  }, [templateCode]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Tab') {
        e.preventDefault();
        const ta = textareaRef.current;
        if (!ta) return;
        const start = ta.selectionStart;
        const end = ta.selectionEnd;
        const newValue = code.substring(0, start) + '  ' + code.substring(end);
        setCode(newValue);
        requestAnimationFrame(() => {
          ta.selectionStart = ta.selectionEnd = start + 2;
        });
      }
    },
    [code],
  );

  return (
    <div className="rounded-lg border bg-card overflow-hidden my-4">
      {/* Editor */}
      <div className="border-b bg-muted/30">
        <div className="flex items-center justify-between px-4 py-2 border-b bg-muted/50">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            JavaScript
          </span>
          <div className="flex gap-1.5">
            <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={handleReset}>
              <RotateCcw className="size-3" /> Reset
            </Button>
            <Button
              size="sm"
              className="h-7 text-xs gap-1"
              onClick={handleRun}
              disabled={allPassed}
            >
              <Play className="size-3" /> Run
            </Button>
          </div>
        </div>
        <textarea
          ref={textareaRef}
          value={code}
          onChange={(e) => setCode(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full bg-transparent p-4 font-mono text-sm leading-6 resize-y min-h-[120px] outline-none"
          spellCheck={false}
          disabled={allPassed}
        />
      </div>

      {/* Results */}
      {(results.length > 0 || error) && (
        <div className="p-4 space-y-2">
          {error && (
            <div className="text-sm text-destructive font-mono">{error}</div>
          )}
          <AnimatePresence>
            {results.map((r, i) => (
              <motion.div
                key={r.label}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`flex items-start gap-2 text-sm font-mono px-3 py-2 rounded ${
                  r.passed ? 'bg-green-500/10 text-green-700 dark:text-green-400' : 'bg-red-500/10 text-red-700 dark:text-red-400'
                }`}
              >
                {r.passed ? <Check className="size-4 mt-0.5 shrink-0" /> : <X className="size-4 mt-0.5 shrink-0" />}
                <div className="min-w-0">
                  <div className="font-medium">{r.label}</div>
                  {!r.passed && (
                    <div className="text-xs mt-0.5 opacity-80">
                      Expected: {r.expected} | Got: {r.actual}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {allPassed && (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center py-2 text-sm font-semibold text-primary"
            >
              All tests passed!
            </motion.div>
          )}
        </div>
      )}

      {/* Hints */}
      {hints && hints.length > 0 && !allPassed && (
        <HintPanel hints={hints} failCount={failCount} />
      )}
    </div>
  );
}
