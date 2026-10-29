import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import IndexedSequence from "../../components/shared/IndexedSequence";
import { code, python, parseInput, buildTrace } from "./algorithm";

const definition = {
  number: "2849",
  phases: [
    { id: "distance", label: "Distances", description: "Compute the horizontal and vertical distances." },
    { id: "check", label: "Check", description: "Compare with the time." },
    { id: "result", label: "Result", description: "Report reachability." },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: "sx, sy, fx, fy, t (e.g. {\"sx\": 2, \"sy\": 4, \"fx\": 7, \"fy\": 7, \"t\": 6})",
  url: "https://leetcode.com/problems/determine-if-a-cell-is-reachable-at-a-given-time/",
  complexity: "O(1) time and O(1) space.",
  examples: [
    { label: "Example 1", input: "{\"sx\": 2, \"sy\": 4, \"fx\": 7, \"fy\": 7, \"t\": 6}" },
    { label: "Example 2", input: "{\"sx\": 3, \"sy\": 1, \"fx\": 7, \"fy\": 3, \"t\": 3}" },
  ],
};

export default function Problem2849Visualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ step }) => (
        <IndexedSequence
          label="dx, dy, t"
          length={step.values.length}
          valueAt={i => String(step.values[i])}
          active={step.active ?? -1}
          roleAt={i => step.roles?.[i] ?? ""}
        />
      )}
      renderReasoning={({ step }) => <p>{step.detail}</p>}
    />
  );
}
