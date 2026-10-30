import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import IndexedSequence from "../../components/shared/IndexedSequence";
import { code, python, parseInput, buildTrace } from "./algorithm";

const definition = {
  number: "2904",
  phases: [
    { id: "setup", label: "Setup", description: "Start an empty best and an empty window." },
    { id: "extend", label: "Extend", description: "Move the right edge forward." },
    { id: "count", label: "Count", description: "Count ones inside the window." },
    { id: "shrink", label: "Shrink", description: "Move the left edge while there are too many ones." },
    { id: "candidate", label: "Compare", description: "Compare the window with the best substring." },
    { id: "done", label: "Result", description: "Report the best substring." },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'JSON {"s":"100011001","k":3}',
  url: "https://leetcode.com/problems/shortest-and-lexicographically-smallest-beautiful-string/",
  complexity: "O(n) time and O(n) space for the best substring. The visualization caps s at 100 characters.",
  examples: [
    { label: "Example 1", input: '{"s":"100011001","k":3}' },
    { label: "Example 2", input: '{"s":"1011","k":2}' },
    { label: "Example 3", input: '{"s":"000","k":1}' },
  ],
};

export default function Problem2904Visualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => (
        <>
          <IndexedSequence
            label="s"
            length={run.input.s.length}
            valueAt={(index) => run.input.s[index]}
            active={step.right ?? -1}
            roleAt={(index) => (step.right !== null && step.left !== null && index >= step.left && index <= step.right ? "window" : "")}
          />
          <output aria-label="Window state">
            {`window ${step.left ?? "-"}..${step.right ?? "-"}, ones ${step.ones}, best "${step.best}"`}
          </output>
        </>
      )}
      renderReasoning={({ step }) => <p>{step.explanation}</p>}
    />
  );
}
