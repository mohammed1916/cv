import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import IndexedSequence from "../../components/shared/IndexedSequence";
import { code, python, parseInput, buildTrace } from "./algorithm";

const definition = {
  number: "2808",
  phases: [
    { id: "setup", label: "Setup", description: "Read the array and its length." },
    { id: "group", label: "Group", description: "Collect the positions of each value." },
    { id: "gap", label: "Gaps", description: "Measure the cyclic gap between consecutive copies." },
    { id: "answer", label: "Best", description: "Keep the best value to spread." },
    { id: "result", label: "Result", description: "Report the minimum seconds." },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: "nums (e.g. {\"nums\": [1,2,1,2]})",
  url: "https://leetcode.com/problems/minimum-seconds-to-equalize-a-circular-array/",
  complexity: "O(n) time and O(n) space. The visualization caps the array at 50 items.",
  examples: [
    { label: "Example 1", input: "{\"nums\": [1, 2, 1, 2]}" },
    { label: "Example 2", input: "{\"nums\": [2, 1, 3, 3, 2]}" },
    { label: "Example 3", input: "{\"nums\": [5, 5, 5, 5]}" },
  ],
};

export default function Problem2808Visualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ step }) => (
        <IndexedSequence
          label="nums"
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
