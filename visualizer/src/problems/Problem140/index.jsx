import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import { getExamplesOr } from "../../config/examplesRegistry";
import WordBreak2Story from "./WordBreak2Story";
import { code, python, parseInput, buildTrace } from "./algorithm";
import "./WordBreakIIVisualizer.css";

const definition = {
  phases: [
    { id: "init", label: "Setup", description: "Prepare the memo table for every suffix." },
    { id: "check", label: "Check", description: "Test each dictionary word at the current position." },
    { id: "recursive_search", label: "Search", description: "Recurse into the remaining suffix." },
    { id: "solution", label: "Solution", description: "Combine a word with the sentences of its suffix." },
    { id: "merge", label: "Merge", description: "Merge sentences into the memo." },
    { id: "memo", label: "Memo", description: "Store the sentences for this suffix." },
    { id: "cache_hit", label: "Cache hit", description: "Reuse sentences already computed for this suffix." },
    { id: "done", label: "Result", description: "Report every sentence." },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'String s | wordDict (e.g. "catsanddog | cat, cats, and, sand, dog")',
  url: "https://leetcode.com/problems/word-break-ii/",
  complexity: "Exponential in the worst case for the number of sentences; the memo shares suffix results. The visualization caps string length at 20, matching the official maximum.",
  examples: getExamplesOr("word-break-ii", []).map((example) => ({
    label: example.label,
    input: example.input ?? JSON.stringify(example.values ?? { nodes: example.nodes, pos: example.pos }),
  })),
};

export default function WordBreakIIVisualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <WordBreak2Story story={run} step={step} />}
      renderReasoning={({ step }) => <p>{step.explanation ?? step.message}</p>}
    />
  );
}
