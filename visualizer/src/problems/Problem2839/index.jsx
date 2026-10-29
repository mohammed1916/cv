import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import IndexedSequence from "../../components/shared/IndexedSequence";
import { code, python, parseInput, buildTrace } from "./algorithm";

const definition = {
  number: "2839",
  phases: [
    { id: "even", label: "Even indices", description: "Group characters at even positions." },
    { id: "odd", label: "Odd indices", description: "Group characters at odd positions." },
    { id: "result", label: "Result", description: "Compare the groups." },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: "s1 and s2 (e.g. {\"s1\": \"abcd\", \"s2\": \"cdab\"})",
  url: "https://leetcode.com/problems/check-if-strings-can-be-made-equal-with-operations-i/",
  complexity: "O(1) time and O(1) space for length 4.",
  examples: [
    { label: "Example 1", input: "{\"s1\": \"abcd\", \"s2\": \"cdab\"}" },
    { label: "Example 2", input: "{\"s1\": \"abcd\", \"s2\": \"dacb\"}" },
  ],
};

export default function Problem2839Visualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ step }) => (
        <IndexedSequence
          label="s1 then s2 (indices 0-3 are s1, 4-7 are s2)"
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
