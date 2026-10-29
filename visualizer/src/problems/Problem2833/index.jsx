import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import IndexedSequence from "../../components/shared/IndexedSequence";
import { code, python, parseInput, buildTrace } from "./algorithm";

const definition = {
  number: "2833",
  phases: [
    { id: "count", label: "Count moves", description: "Count L, R and underscore moves." },
    { id: "result", label: "Result", description: "Combine the counts." },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: "moves (e.g. {\"moves\": \"L_RL__R\"})",
  url: "https://leetcode.com/problems/furthest-point-from-origin/",
  complexity: "O(n) time and O(1) extra space for moves length n. The visualization caps length at 50.",
  examples: [
    { label: "Example 1", input: "{\"moves\": \"L_RL__R\"}" },
    { label: "Example 2", input: "{\"moves\": \"_R__LL_\"}" },
    { label: "Example 3", input: "{\"moves\": \"_______\"}" },
  ],
};

export default function Problem2833Visualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ step }) => (
        <IndexedSequence
          label="moves"
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
