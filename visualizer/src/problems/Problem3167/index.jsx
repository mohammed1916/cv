import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import CompressionLedgerView from "./CompressionLedgerView";
import { code, python, parseInput, buildTrace } from "./algorithm.js";

const phases = [
  { id: "start", label: "Start", description: "Clear the 26 letter totals." },
  { id: "group", label: "Group", description: "Add one group's frequency to its letter." },
  { id: "emit", label: "Emit", description: "Write a letter that has a total." },
  { id: "done", label: "Result", description: "Return the compressed string." },
];

const definition = {
  number: "3167",
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Compressed string of letter-and-number groups (e.g. "b12a3b4")',
  url: "https://leetcode.com/problems/better-compression-of-string/",
  complexity: "O(n + 26) time and O(1) extra space for n characters of input. The visualization accepts up to 16 groups with frequencies of up to six digits; the official limits are not verified here.",
  examples: [
    { label: "Split letters", input: '"b12a3b4"' },
    { label: "One group", input: '"z1"' },
    { label: "Repeated letter", input: '"c2c2c2a10a1"' },
  ],
};

export default function BetterCompressionVisualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <CompressionLedgerView run={run} step={step} />}
      renderReasoning={({ run }) => (
        <p>
          A letter can appear in several groups, so its frequencies are added first. Writing the letters in alphabetical order gives one group per letter: {run.result}.
        </p>
      )}
    />
  );
}
