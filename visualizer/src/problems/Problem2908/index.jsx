import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import IndexedSequence from "../../components/shared/IndexedSequence";
import { code, python, parseInput, buildTrace } from "./algorithm";

const definition = {
  number: "2908",
  phases: [
    { id: "setup", label: "Setup", description: "Start with no mountain found." },
    { id: "peak", label: "Peak", description: "Choose the middle index j." },
    { id: "left", label: "Left", description: "Find the cheapest left partner." },
    { id: "right", label: "Right", description: "Find the cheapest right partner." },
    { id: "record", label: "Record", description: "Keep the smallest mountain sum." },
    { id: "done", label: "Result", description: "Report the best sum or -1." },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'JSON {"nums":[8,6,1,5,3]}',
  url: "https://leetcode.com/problems/minimum-sum-of-mountain-triplets-i/",
  complexity: "O(n^2) time and O(1) space for this per-peak scan. The visualization caps nums at 50 values.",
  examples: [
    { label: "Example 1", input: '{"nums":[8,6,1,5,3]}' },
    { label: "Example 2", input: '{"nums":[5,4,8,7,10,2]}' },
    { label: "Example 3", input: '{"nums":[6,5,4,3,4,5]}' },
  ],
};

export default function Problem2908Visualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => (
        <>
          <IndexedSequence
            label="nums"
            length={run.input.nums.length}
            valueAt={(index) => run.input.nums[index]}
            active={step.j ?? -1}
            roleAt={(index) => (index === step.j ? "peak" : "")}
          />
          <output aria-label="Mountain state">
            {`peak j = ${step.j ?? "-"}, left min ${step.leftMin ?? "-"}, right min ${step.rightMin ?? "-"}, best ${step.best}`}
          </output>
        </>
      )}
      renderReasoning={({ step }) => <p>{step.explanation}</p>}
    />
  );
}
