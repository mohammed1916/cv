import { useEffect, useRef, useState } from "react";
import Editor from "@monaco-editor/react";

const VIZ_API_TYPES = `
type VizState = string | null;
interface VizSequence {
  readonly length: number;
  get(index: number): unknown; set(index: number, value: unknown): unknown;
  push(value: unknown): unknown; pop(): unknown;
  unshift(value: unknown): unknown; shift(): unknown;
  insert(index: number, value: unknown): unknown; remove(index: number): unknown;
  swap(left: number, right: number): unknown;
  mark(index: number, state?: VizState): unknown;
  point(name: string, index: number, state?: VizState): unknown;
  clearMarks(): unknown; clear(): unknown; values(): unknown[];
}
interface VizString extends VizSequence {
  toString(): string; setValue(value: string): unknown; append(value: string): unknown;
}
interface VizStack extends VizSequence { peek(): unknown; }
interface VizQueue extends VizSequence {
  enqueue(value: unknown): unknown; dequeue(): unknown; front(): unknown;
}
interface VizDeque extends VizSequence {
  pushFront(value: unknown): unknown; pushBack(value: unknown): unknown;
  popFront(): unknown; popBack(): unknown; front(): unknown; back(): unknown;
}
interface VizGrid {
  readonly rows: number; readonly columns: number;
  get(row: number, column: number): unknown;
  values(): unknown[][];
  set(row: number, column: number, value: unknown): unknown;
  fill(value: unknown): unknown;
  mark(row: number, column: number, state?: VizState): unknown;
  clearMarks(): unknown; resize(rows: number, columns: number, fill?: unknown): unknown;
}
interface VizNodeLink {
  addNode(id: unknown, options?: object | unknown): unknown;
  removeNode(id: unknown): unknown;
  addEdge(from: unknown, to: unknown, options?: object): unknown;
  removeEdge(from: unknown, to: unknown): unknown;
  setNode(id: unknown, options: object | unknown): unknown;
  markNode(id: unknown, state?: VizState): unknown;
  markEdge(from: unknown, to: unknown, state?: VizState): unknown;
  clearMarks(): unknown; neighbors(id: unknown): unknown[];
  setRoot?(id: unknown): unknown;
  addChild?(parent: unknown, child: unknown, options?: object | unknown): unknown;
}
interface VizLinkedList {
  readonly length: number; values(): unknown[];
  append(value: unknown, id?: unknown): unknown;
  prepend(value: unknown, id?: unknown): unknown;
  insertAfter(afterId: unknown, value: unknown, id?: unknown): unknown;
  remove(id: unknown): unknown; set(id: unknown, value: unknown): unknown;
  mark(id: unknown, state?: VizState): unknown; clearMarks(): unknown;
}
interface VizTrie {
  insert(word: string): unknown; contains(word: string): boolean;
  markWord(word: string, state?: VizState): unknown; clearMarks(): unknown;
}
interface VizHeap {
  readonly size: number; values(): unknown[]; peek(): unknown;
  push(value: unknown): unknown; pop(): unknown;
  mark(index: number, state?: VizState): unknown; clearMarks(): unknown;
}
interface VizMap {
  readonly size: number; entries(): unknown[][];
  set(key: unknown, value: unknown): unknown;
  get(key: unknown): unknown; has(key: unknown): boolean;
  delete(key: unknown): boolean; mark(key: unknown, state?: VizState): unknown;
  clear(): unknown;
}
interface VizSet {
  readonly size: number; values(): unknown[];
  add(value: unknown): unknown; has(value: unknown): boolean;
  delete(value: unknown): boolean; mark(value: unknown, state?: VizState): unknown;
  clear(): unknown;
}
interface VizScalar {
  get(): unknown; set(value: unknown): unknown;
  increment(amount?: number): unknown; decrement(amount?: number): unknown;
  mark(state?: VizState): unknown; clearMark(): unknown;
}
interface VizApi {
  array(name: string, values?: unknown[]): VizSequence;
  string(name: string, value?: string): VizString;
  stack(name: string, values?: unknown[]): VizStack;
  queue(name: string, values?: unknown[]): VizQueue;
  deque(name: string, values?: unknown[]): VizDeque;
  grid(name: string, config?: object | number | unknown[][], columns?: number): VizGrid;
  dp(name: string, config?: object | number | unknown[][], columns?: number): VizGrid;
  graph(name: string, config?: object): VizNodeLink;
  tree(name: string, config?: object): VizNodeLink;
  linkedList(name: string, values?: unknown[]): VizLinkedList;
  trie(name: string, config?: object): VizTrie;
  heap(name: string, config?: object | unknown[]): VizHeap;
  map(name: string, entries?: unknown): VizMap;
  set(name: string, values?: unknown[]): VizSet;
  scalar(name: string, value?: unknown): VizScalar;
  step(message: string, callback?: () => void | Promise<void>): void;
}
declare const viz: VizApi;
`;

function getEditorTheme() {
  if (typeof document === "undefined") return "vs-dark";
  return document.documentElement.dataset.theme === "dark" ? "vs-dark" : "vs";
}

export default function RuntimeCodeEditor({ value, onChange, onRun, isBusy }) {
  const [theme, setTheme] = useState(getEditorTheme);
  const runRef = useRef(onRun);
  const extraLibRef = useRef(null);

  useEffect(() => {
    runRef.current = onRun;
  }, [onRun]);

  useEffect(() => {
    if (typeof MutationObserver === "undefined") return undefined;

    const observer = new MutationObserver(() => setTheme(getEditorTheme()));
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    return () => observer.disconnect();
  }, []);

  useEffect(() => () => extraLibRef.current?.dispose(), []);

  return (
    <div className="runtime-code-editor" aria-busy={isBusy}>
      <Editor
        height="100%"
        language="javascript"
        path="visualizer-playground.js"
        theme={theme}
        value={value}
        onChange={(nextValue) => onChange(nextValue ?? "")}
        loading={<div className="runtime-code-editor__loading">Loading editor...</div>}
        options={{
          automaticLayout: true,
          contextmenu: true,
          fontFamily:
            '"Fira Code", "Cascadia Code", Consolas, "Courier New", monospace',
          fontLigatures: true,
          fontSize: 14,
          lineHeight: 22,
          minimap: { enabled: false },
          padding: { top: 14, bottom: 14 },
          renderLineHighlight: "all",
          scrollBeyondLastLine: false,
          smoothScrolling: true,
          tabSize: 2,
          wordWrap: "on",
        }}
        onMount={(editor, monaco) => {
          extraLibRef.current?.dispose();
          extraLibRef.current =
            monaco.languages.typescript?.javascriptDefaults?.addExtraLib(
              VIZ_API_TYPES,
              "file:///visualizer-playground-viz-api.d.ts",
            ) ?? null;
          editor.updateOptions({
            ariaLabel: "JavaScript visualization source editor",
          });
          editor.addCommand(
            monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter,
            () => runRef.current?.(),
          );
          editor.focus();
        }}
      />
    </div>
  );
}
