import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import MergeCloseView from "./MergeCloseView";
import { code, python, parseInput, buildTrace, phases } from "./algorithm.js";

const definition = {
  number: "4019",
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Object with s (lowercase letters) and k (maximum distance)',
  url: "https://leetcode.com/problems/merge-close-characters-ii/",
  complexity: "Each pass scans up to n times k pairs and a round can delete one character, so the simple simulation costs O(n^2 * k) time in the worst case. The visualization caps s at 16 letters; the official bounds are not verified in this draft.",
  examples: [
    { label: "Adjacent pair", input: '{"s":"aab","k":1}' },
    { label: "Far end matches", input: '{"s":"abca","k":3}' },
    { label: "Chained merges", input: '{"s":"banana","k":2}' },
    { label: "Single letter", input: "{\"s\":\"a\",\"k\":1}" },
    { label: "Equal letters", input: "{\"s\":\"aaaa\",\"k\":2}" },
    { label: "Longest word, largest k", input: "{\"s\":\"zyxwvutsrqponmlk\",\"k\":16}" },
    { label: "All distinct letters", input: "{\"s\":\"abcdefghijklmnop\",\"k\":1}" },
    { label: "Long run: 16 letters", input: "{\"s\":\"adebbbdcdaebedec\",\"k\":8}" },
  ],
};

export default function Problem4019Visualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <MergeCloseView run={run} step={step} />}
      renderReasoning={({ run, step }) => (
        <p>
          {step.message} {run ? `Deleted ${step.removed?.length ?? 0} character${(step.removed?.length ?? 0) === 1 ? "" : "s"} so far.` : ""}
        </p>
      )}
    />
  );
}
