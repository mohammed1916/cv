import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import IndexedSequence from "../../components/shared/IndexedSequence";
import FrequencyCountTable from "../../components/shared/FrequencyCountTable";
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
  examples: [{ label: "Example 1", input: '{"word":"leetcodeleet","k":4}' },
    { label: "Single block", input: "{\"word\":\"abc\",\"k\":3}" },
    { label: "Every letter its own block", input: "{\"word\":\"aab\",\"k\":1}" },
    { label: "Long run: 60 letters, blocks of 6", input: "{\"word\":\"aabbbacbcccabbcaacbcabcaabbacbcbcbcbcbcbccbcbcccbbacaaacacac\",\"k\":6}" },
  ],
};

export default function KPeriodicWordVisualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => {
        const total = run.input.word.length / run.input.k;
        const counts = Object.entries(step.counts);
        const top = counts.length ? counts.reduce((a, b) => (b[1] > a[1] ? b : a))[0] : null;
        const finished = step.phase === "count" || step.phase === "done";
        return (
          <>
            <IndexedSequence label="Blocks of length k" length={total}
              valueAt={i => run.input.word.slice(i * run.input.k, (i + 1) * run.input.k)}
              active={step.index ?? -1}
              roleAt={i => (finished && step.blocks[i] === top ? "kept" : finished ? "changed" : "")} />
            <FrequencyCountTable title="Count of each block" entries={counts} active={step.block} emptyText="No blocks counted yet." />
            <p>Blocks that match the most common block stay as they are. Every other block costs one operation.</p>
          </>
        );
      }}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  );
}
