import { useState } from 'react';
import { Check, Copy } from 'lucide-react';

interface CodeBlockProps {
  code: string;
  title?: string;
  onLoadInEditor?: () => void;
}

const PY_KEYWORDS = new Set([
  'def',
  'return',
  'if',
  'elif',
  'else',
  'for',
  'while',
  'in',
  'not',
  'and',
  'or',
  'try',
  'except',
  'pass',
  'break',
  'continue',
  'import',
  'from',
  'as',
  'is',
  'None',
  'True',
  'False'
]);

const PY_BUILTINS = new Set([
  'int',
  'str',
  'list',
  'set',
  'dict',
  'len',
  'range',
  'map',
  'input',
  'print',
  'sorted',
  'max',
  'min',
  'sum',
  'all',
  'any',
  'type',
  'id'
]);

function highlightPythonLine(line: string) {
  // Split comment outside quotes safely
  let commentIdx = -1;
  let inQuote: string | null = null;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuote) {
      if (ch === inQuote && line[i - 1] !== '\\') inQuote = null;
    } else {
      if (ch === '"' || ch === "'") inQuote = ch;
      else if (ch === '#') {
        commentIdx = i;
        break;
      }
    }
  }

  const codePart = commentIdx >= 0 ? line.slice(0, commentIdx) : line;
  const commentPart = commentIdx >= 0 ? line.slice(commentIdx) : '';

  const tokens = codePart.match(/("[^"]*"|'[^']*'|\b\d+\b|\b[A-Za-z_][A-Za-z0-9_]*\b|[^\sA-Za-z0-9_"']+|\s+)/g) || [];

  return (
    <>
      {tokens.map((tok, idx) => {
        if ((tok.startsWith('"') && tok.endsWith('"')) || (tok.startsWith("'") && tok.endsWith("'"))) {
          return (
            <span key={idx} className="text-emerald-700 dark:text-emerald-400">
              {tok}
            </span>
          );
        }
        if (/^\d+$/.test(tok)) {
          return (
            <span key={idx} className="text-violet-700 dark:text-violet-400">
              {tok}
            </span>
          );
        }
        if (PY_KEYWORDS.has(tok)) {
          return (
            <span key={idx} className="text-amber-700 dark:text-amber-400 font-medium">
              {tok}
            </span>
          );
        }
        if (PY_BUILTINS.has(tok)) {
          return (
            <span key={idx} className="text-sky-700 dark:text-sky-400">
              {tok}
            </span>
          );
        }
        return <span key={idx}>{tok}</span>;
      })}
      {commentPart && (
        <span className="text-slate-500 dark:text-slate-500 italic">{commentPart}</span>
      )}
    </>
  );
}

export function CodeBlock({ code, title = 'Python 3', onLoadInEditor }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const lines = code.split('\n');

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard blocked in sandbox
    }
  };

  return (
    <div className="rounded-lg border border-slate-200 dark:border-[#232B3A] bg-slate-50 dark:bg-[#0D1118] overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-200 dark:border-[#232B3A] bg-white dark:bg-[#131822]">
        <span className="text-xs font-mono text-slate-600 dark:text-slate-400">{title}</span>
        <div className="flex items-center gap-3">
          {onLoadInEditor && (
            <button
              type="button"
              onClick={onLoadInEditor}
              className="text-xs font-medium text-amber-700 dark:text-amber-400 hover:underline whitespace-nowrap shrink-0 cursor-pointer"
            >
              Load into Editor
            </button>
          )}
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
      </div>
      <div className="overflow-x-auto p-4 font-mono text-[13px] leading-6 text-slate-800 dark:text-slate-200">
        {lines.map((line, i) => (
          <div key={i} className="flex">
            <span className="select-none w-8 shrink-0 text-right pr-4 text-slate-400 dark:text-slate-600 tabular-nums">
              {i + 1}
            </span>
            <span className="whitespace-pre">{line.length > 0 ? highlightPythonLine(line) : ' '}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
