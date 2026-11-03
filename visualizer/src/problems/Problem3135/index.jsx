import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import CommonRunView from "./CommonRunView";
import { code, python, parseInput, buildTrace } from "./algorithm.js";

const phases = [
  { id: "start", label: "Table", description: "Zero table for the two strings." },
  { id: "compare", label: "Compare", description: "Check one letter of s against one letter of t." },
  { id: "match", label: "Extend", description: "Equal letters extend the shared run." },
  { id: "miss", label: "Reset", description: "Different letters end the shared run." },
  { id: "done", label: "Result", description: "Turn the best shared run into operations." },
];

const definition = {
  number: "3135",
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Object with s and t (e.g. {"s":"abc","t":"def"})',
  url: "https://leetcode.com/problems/equalize-strings-by-adding-or-removing-characters-at-ends/",
  complexity: "O(|s| × |t|) time and space for the run table. The visualization accepts strings of 1 to 12 lowercase letters; the official bounds are not verified here. The answer assumes a shared piece must be contiguous in both strings.",
  examples: [
    { label: "Shared core", input: '{"s":"xxhelloyy","t":"hello"}' },
    { label: "Nothing shared", input: '{"s":"abc","t":"xyz"}' },
    { label: "Shifted middle", input: '{"s":"stone","t":"tones"}' },
  ],
};

export default function EqualizeByEndsVisualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <CommonRunView run={run} step={step} />}
      renderReasoning={({ run, step }) => (
        <p>
          The strings only shrink from their ends, so they can only meet on a shared contiguous piece. The table finds the longest such piece: {step.best} for {run.input.s} and {run.input.t}, giving {run.result} operations.
        </p>
      )}
    />
  );
}
