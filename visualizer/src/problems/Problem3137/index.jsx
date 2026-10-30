import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import IndexedSequence from "../../components/shared/IndexedSequence";
import { code, python, parseInput, buildTrace } from "./algorithm";

const definition = {
  number: 3137,
  phases: [
    { id: "setup", label: "Setup", description: "Prepare an empty count of blocks." },
    { id: "scan", label: "Blocks", description: "Cut the word into blocks of length k and count them." },
    { id: "count", label: "Most common", description: "Find the most frequent block." },
    { id: "done", label: "Result", description: "Return blocks minus the most frequent count." },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'JSON: {"word": "leetcodeleet", "k": 4}',
  url: "https://leetcode.com/problems/minimum-number-of-operations-to-make-word-k-periodic/",
  complexity: "O(n) time and O(n) space, where n is the word length. The visualization caps the word at 60 letters.",
  examples: [{ label: "Example 1", input: '{"word":"leetcodeleet","k":4}' }],
};

export default function KPeriodicWordVisualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => (
        <>
          <IndexedSequence label="Blocks of length k" length={run.input.word.length / run.input.k}
            valueAt={i => run.input.word.slice(i * run.input.k, (i + 1) * run.input.k)}
            active={step.index ?? -1} roleAt={i => (i === step.index ? "active" : "")} />
          <p>Counts: {Object.entries(step.counts).map(([b, c]) => `${b}×${c}`).join(", ") || "none yet"}</p>
        </>
      )}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  );
}
