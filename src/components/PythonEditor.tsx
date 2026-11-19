import { useEffect, useRef } from 'react';
import { EditorState } from '@codemirror/state';
import {
  EditorView,
  keymap,
  lineNumbers,
  highlightActiveLine,
  highlightActiveLineGutter,
  drawSelection,
  dropCursor,
  rectangularSelection,
  crosshairCursor
} from '@codemirror/view';
import { defaultKeymap, history, historyKeymap, indentWithTab } from '@codemirror/commands';
import {
  indentOnInput,
  bracketMatching,
  foldGutter,
  foldKeymap,
  indentUnit,
  HighlightStyle,
  syntaxHighlighting
} from '@codemirror/language';
import { python } from '@codemirror/lang-python';
import { closeBrackets, closeBracketsKeymap, autocompletion } from '@codemirror/autocomplete';
import { tags } from '@lezer/highlight';

interface PythonEditorProps {
  value: string;
  onChange: (next: string) => void;
  theme: 'dark' | 'light';
  fontSize: number;
  onRunShortcut?: () => void;
  onSubmitShortcut?: () => void;
}

const darkHighlight = HighlightStyle.define([
  { tag: tags.keyword, color: '#F59E0B', fontWeight: '500' },
  { tag: [tags.controlKeyword, tags.definitionKeyword], color: '#FBBF24', fontWeight: '500' },
  { tag: [tags.name, tags.deleted, tags.character, tags.macroName], color: '#E2E8F0' },
  { tag: [tags.function(tags.variableName), tags.labelName], color: '#38BDF8' },
  { tag: [tags.color, tags.constant(tags.name), tags.standard(tags.name)], color: '#C084FC' },
  { tag: [tags.definition(tags.name), tags.separator], color: '#F1F5F9' },
  { tag: [tags.typeName, tags.className, tags.number, tags.changed, tags.annotation, tags.modifier, tags.self, tags.namespace], color: '#A78BFA' },
  { tag: [tags.operator, tags.operatorKeyword], color: '#94A3B8' },
  { tag: [tags.string, tags.special(tags.string)], color: '#34D399' },
  { tag: tags.comment, color: '#64748B', fontStyle: 'italic' },
  { tag: tags.bool, color: '#FB923C' }
]);

const lightHighlight = HighlightStyle.define([
  { tag: tags.keyword, color: '#B45309', fontWeight: '600' },
  { tag: [tags.controlKeyword, tags.definitionKeyword], color: '#B45309', fontWeight: '600' },
  { tag: [tags.name, tags.deleted, tags.character, tags.macroName], color: '#0F172A' },
  { tag: [tags.function(tags.variableName), tags.labelName], color: '#0369A1' },
  { tag: [tags.color, tags.constant(tags.name), tags.standard(tags.name)], color: '#7E22CE' },
  { tag: [tags.definition(tags.name), tags.separator], color: '#0F172A' },
  { tag: [tags.typeName, tags.className, tags.number, tags.changed, tags.annotation, tags.modifier, tags.self, tags.namespace], color: '#6D28D9' },
  { tag: [tags.operator, tags.operatorKeyword], color: '#475569' },
  { tag: [tags.string, tags.special(tags.string)], color: '#047857' },
  { tag: tags.comment, color: '#64748B', fontStyle: 'italic' },
  { tag: tags.bool, color: '#C2410C' }
]);

function buildEditorTheme(mode: 'dark' | 'light', fontSize: number) {
  const isDark = mode === 'dark';
  return EditorView.theme(
    {
      '&': {
        backgroundColor: isDark ? '#0D1118' : '#FFFFFF',
        color: isDark ? '#E2E8F0' : '#0F172A',
        fontSize: `${fontSize}px`,
        height: '100%'
      },
      '.cm-content': {
        caretColor: '#F59E0B',
        padding: '12px 0'
      },
      '.cm-cursor, .cm-dropCursor': {
        borderLeftColor: '#F59E0B',
        borderLeftWidth: '2px'
      },
      '&.cm-focused .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection': {
        backgroundColor: isDark ? 'rgba(245, 158, 11, 0.22)' : 'rgba(217, 119, 6, 0.16)'
      },
      '.cm-gutters': {
        backgroundColor: isDark ? '#0D1118' : '#F8FAFC',
        color: isDark ? '#475569' : '#94A3B8',
        borderRight: isDark ? '1px solid #1E2532' : '1px solid #E2E8F0',
        paddingRight: '4px'
      },
      '.cm-activeLineGutter': {
        backgroundColor: isDark ? '#151C28' : '#F1F5F9',
        color: isDark ? '#CBD5E1' : '#334155'
      },
      '.cm-activeLine': {
        backgroundColor: isDark ? 'rgba(30, 41, 59, 0.45)' : 'rgba(241, 245, 249, 0.7)'
      },
      '.cm-matchingBracket': {
        backgroundColor: isDark ? 'rgba(245, 158, 11, 0.25)' : 'rgba(217, 119, 6, 0.2)',
        outline: 'none'
      },
      '.cm-tooltip': {
        backgroundColor: isDark ? '#161D2A' : '#FFFFFF',
        border: isDark ? '1px solid #2A3446' : '1px solid #CBD5E1',
        color: isDark ? '#E2E8F0' : '#0F172A'
      }
    },
    { dark: isDark }
  );
}

export function PythonEditor({
  value,
  onChange,
  theme,
  fontSize,
  onRunShortcut,
  onSubmitShortcut
}: PythonEditorProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const viewRef = useRef<EditorView | null>(null);
  const onChangeRef = useRef(onChange);
  const runRef = useRef(onRunShortcut);
  const submitRef = useRef(onSubmitShortcut);
  const latestValueRef = useRef(value);

  onChangeRef.current = onChange;
  runRef.current = onRunShortcut;
  submitRef.current = onSubmitShortcut;
  latestValueRef.current = value;

  useEffect(() => {
    const parent = containerRef.current;
    if (!parent) return;

    const customKeys = keymap.of([
      {
        key: 'Mod-Enter',
        run: () => {
          runRef.current?.();
          return true;
        }
      },
      {
        key: 'Mod-Shift-Enter',
        run: () => {
          submitRef.current?.();
          return true;
        }
      }
    ]);

    const state = EditorState.create({
      doc: latestValueRef.current,
      extensions: [
        lineNumbers(),
        highlightActiveLineGutter(),
        history(),
        foldGutter(),
        drawSelection(),
        dropCursor(),
        EditorState.allowMultipleSelections.of(true),
        indentOnInput(),
        indentUnit.of('    '),
        bracketMatching(),
        closeBrackets(),
        autocompletion(),
        rectangularSelection(),
        crosshairCursor(),
        highlightActiveLine(),
        python(),
        syntaxHighlighting(theme === 'dark' ? darkHighlight : lightHighlight),
        buildEditorTheme(theme, fontSize),
        customKeys,
        keymap.of([
          ...closeBracketsKeymap,
          ...defaultKeymap,
          ...historyKeymap,
          ...foldKeymap,
          indentWithTab
        ]),
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            const docText = update.state.doc.toString();
            latestValueRef.current = docText;
            onChangeRef.current(docText);
          }
        })
      ]
    });

    const view = new EditorView({ state, parent });
    viewRef.current = view;

    return () => {
      view.destroy();
      viewRef.current = null;
    };
  }, [theme, fontSize]);

  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    const currentDoc = view.state.doc.toString();
    if (value !== currentDoc) {
      view.dispatch({
        changes: { from: 0, to: currentDoc.length, insert: value }
      });
    }
  }, [value]);

  return (
    <div
      ref={containerRef}
      className="h-full w-full overflow-hidden bg-white dark:bg-[#0D1118]"
      aria-label="Python 3 Code Editor"
    />
  );
}
