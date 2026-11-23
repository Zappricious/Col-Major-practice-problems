import { useEffect, useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import {
  ChevronLeft,
  ChevronRight,
  Download,
  ExternalLink,
  Loader2,
  X,
  ZoomIn,
  ZoomOut
} from 'lucide-react';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorkerUrl;

interface PdfViewerModalProps {
  url: string;
  title: string;
  onClose: () => void;
}

const PROBLEM_PAGES: { label: string; page: number }[] = [
  { label: 'P01 — Collatz Steps (p. 1)', page: 1 },
  { label: 'P02 — Sum of the Valid Numbers (p. 3)', page: 3 },
  { label: 'P03 — Recursive Palindrome (p. 5)', page: 5 },
  { label: 'P04 — Versions of a List (p. 6)', page: 6 },
  { label: 'P05 — Count in a Sorted List (p. 8)', page: 8 },
  { label: 'P06 — Stairs with Broken Steps (p. 10)', page: 10 },
  { label: 'P07 — Best Block Sum (p. 12)', page: 12 },
  { label: 'P08 — Subsets with a Given Sum (p. 14)', page: 14 },
  { label: 'P09 — Queens on a Board (p. 16)', page: 16 },
  { label: 'P10 — Tower of Hanoi k-th Move (p. 17)', page: 17 },
  { label: 'P11 — Recursive Star Pattern (p. 19)', page: 19 },
  { label: 'P12 — In-Place Partitioning (p. 21)', page: 21 },
  { label: 'P13 — Merging Two Sorted Lists (p. 24)', page: 24 },
  { label: 'P14 — Strongest Stock Price Rally (p. 26)', page: 26 },
  { label: 'P15 — Distinct Permutations (p. 28)', page: 28 },
  { label: 'P16 — Integer Logarithm (p. 30)', page: 30 },
  { label: 'P17 — Counting Ones in Binary (p. 32)', page: 32 },
  { label: 'P18 — Lab Slots for Students (p. 34)', page: 34 },
  { label: 'P19 — Seating Arrangement (p. 35)', page: 35 },
  { label: 'P20 — Power of a Matrix (p. 36)', page: 36 },
  { label: 'P21 — Grid Paths with Obstacles (p. 38)', page: 38 },
  { label: 'P22 — Combination Sum (p. 40)', page: 40 }
];

export function PdfViewerModal({ url, title, onClose }: PdfViewerModalProps) {
  const [pdfDoc, setPdfDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [numPages, setNumPages] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.25);
  const [loading, setLoading] = useState(true);
  const [rendering, setRendering] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const renderTaskRef = useRef<pdfjsLib.RenderTask | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    const loadingTask = pdfjsLib.getDocument({ url });
    loadingTask.promise
      .then((doc) => {
        if (cancelled) return;
        setPdfDoc(doc);
        setNumPages(doc.numPages);
        setPageNumber(1);
        setLoading(false);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : 'Unable to load PDF document.');
        setLoading(false);
      });

    return () => {
      cancelled = true;
      void loadingTask.destroy();
    };
  }, [url]);

  useEffect(() => {
    if (!pdfDoc || !canvasRef.current) return;

    let cancelled = false;
    setRendering(true);

    const renderPage = async () => {
      try {
        if (renderTaskRef.current) {
          renderTaskRef.current.cancel();
          renderTaskRef.current = null;
        }

        const page = await pdfDoc.getPage(pageNumber);
        if (cancelled) return;

        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const viewport = page.getViewport({ scale });
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = Math.floor(viewport.width * dpr);
        canvas.height = Math.floor(viewport.height * dpr);
        canvas.style.width = `${Math.floor(viewport.width)}px`;
        canvas.style.height = `${Math.floor(viewport.height)}px`;

        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        const task = page.render({
          canvasContext: ctx,
          viewport,
          canvas
        });
        renderTaskRef.current = task;
        await task.promise;
        if (!cancelled) {
          setRendering(false);
          if (scrollRef.current) {
            scrollRef.current.scrollTop = 0;
          }
        }
      } catch (err: unknown) {
        if (
          err &&
          typeof err === 'object' &&
          'name' in err &&
          (err as { name: string }).name === 'RenderingCancelledException'
        ) {
          return;
        }
        if (!cancelled) {
          setRendering(false);
        }
      }
    };

    void renderPage();

    return () => {
      cancelled = true;
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
      }
    };
  }, [pdfDoc, pageNumber, scale]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowRight') {
        setPageNumber((p) => (numPages ? Math.min(numPages, p + 1) : p));
      } else if (e.key === 'ArrowLeft') {
        setPageNumber((p) => Math.max(1, p - 1));
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [numPages, onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-3 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onClick={onClose}
    >
      <div
        className="w-full max-w-5xl h-[90vh] bg-white dark:bg-[#111620] border border-slate-200 dark:border-[#232B3A] rounded-lg flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Modal Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 sm:px-5 py-3 border-b border-slate-200 dark:border-[#232B3A] bg-white dark:bg-[#131924]">
          <div className="min-w-0">
            <h2 className="font-display text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
              {title}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Original course booklet · Use arrow keys or jump to any problem
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <a
              href={url}
              download="COL1000_Practice_Problems_v2.pdf"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-[#1C2434] hover:bg-slate-200 dark:hover:bg-[#253046] rounded-md transition-colors whitespace-nowrap"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Download</span>
            </a>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-[#1C2434] hover:bg-slate-200 dark:hover:bg-[#253046] rounded-md transition-colors whitespace-nowrap"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Open Tab</span>
            </a>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-md cursor-pointer"
              aria-label="Close PDF viewer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Navigation & Zoom Bar */}
        <div className="px-4 py-2 border-b border-slate-200 dark:border-[#1E2634] bg-slate-50 dark:bg-[#0E131C] flex flex-wrap items-center justify-between gap-3">
          {/* Page Controls */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={pageNumber <= 1 || loading}
              onClick={() => setPageNumber((p) => Math.max(1, p - 1))}
              className="p-1.5 rounded text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-[#1C2434] disabled:opacity-35 cursor-pointer"
              aria-label="Previous page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-mono text-xs text-slate-700 dark:text-slate-300 tabular-nums px-2">
              Page {numPages > 0 ? pageNumber : '—'} / {numPages || '—'}
            </span>
            <button
              type="button"
              disabled={pageNumber >= numPages || loading}
              onClick={() => setPageNumber((p) => Math.min(numPages, p + 1))}
              className="p-1.5 rounded text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-[#1C2434] disabled:opacity-35 cursor-pointer"
              aria-label="Next page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Jump to Problem */}
          <select
            aria-label="Jump to problem page"
            value={
              PROBLEM_PAGES.reduce(
                (best, item) => (item.page <= pageNumber ? item.page : best),
                1
              )
            }
            onChange={(e) => setPageNumber(Number(e.target.value))}
            disabled={loading || numPages === 0}
            className="max-w-[260px] px-2.5 py-1 text-xs bg-white dark:bg-[#151C28] text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-[#263144] rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500/50"
          >
            {PROBLEM_PAGES.map((item) => (
              <option key={item.page} value={item.page}>
                {item.label}
              </option>
            ))}
          </select>

          {/* Zoom Controls */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={scale <= 0.75}
              onClick={() => setScale((s) => Math.max(0.75, Number((s - 0.15).toFixed(2))))}
              className="p-1.5 rounded text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-[#1C2434] disabled:opacity-35 cursor-pointer"
              aria-label="Zoom out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="font-mono text-xs text-slate-600 dark:text-slate-300 tabular-nums w-12 text-center">
              {Math.round(scale * 100)}%
            </span>
            <button
              type="button"
              disabled={scale >= 2.15}
              onClick={() => setScale((s) => Math.min(2.15, Number((s + 0.15).toFixed(2))))}
              className="p-1.5 rounded text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-[#1C2434] disabled:opacity-35 cursor-pointer"
              aria-label="Zoom in"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Canvas Viewport */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-auto bg-slate-200/80 dark:bg-[#090C11] p-4 sm:p-6 flex flex-col items-center"
        >
          {loading ? (
            <div className="my-auto flex flex-col items-center gap-2.5 text-slate-600 dark:text-slate-400">
              <Loader2 className="w-6 h-6 animate-spin text-amber-500" />
              <span className="text-xs">Loading COL1000 PDF booklet...</span>
            </div>
          ) : error ? (
            <div className="my-auto max-w-md text-center space-y-3 p-6 rounded-lg bg-white dark:bg-[#111620] border border-slate-200 dark:border-[#232B3A]">
              <p className="text-sm font-medium text-rose-600 dark:text-rose-400">
                Could not render PDF inline
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-400">{error}</p>
              <a
                href={url}
                download="COL1000_Practice_Problems_v2.pdf"
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-md"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download PDF</span>
              </a>
            </div>
          ) : (
            <div className="relative shadow-lg bg-white rounded-sm overflow-hidden">
              <canvas ref={canvasRef} className="block" />
              {rendering && (
                <div className="absolute inset-0 bg-white/40 flex items-center justify-center">
                  <Loader2 className="w-5 h-5 animate-spin text-amber-600" />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
