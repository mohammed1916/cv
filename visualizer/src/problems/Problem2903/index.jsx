import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import IndexedSequence from "../../components/shared/IndexedSequence";
import { code, python, parseInput, buildTrace } from "./algorithm";

const definition = {
  number: "2903",
  phases: [
    { id: "setup", label: "Setup", description: "Read the array length." },
    { id: "loop", label: "Outer", description: "Pick the first index i." },
    { id: "check", label: "Check", description: "Test a candidate pair (i, j)." },
    { id: "done", label: "Result", description: "Report the pair or [-1, -1]." },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'JSON {"nums":[...],"indexDifference":2,"valueDifference":4}',
  url: "https://leetcode.com/problems/find-indices-with-index-and-value-difference-i/",
  complexity: "O(n^2) time and O(1) space. The visualization caps nums at 100 values.",
  examples: [
    { label: "Example 1", input: '{"nums":[5,1,4,1],"indexDifference":2,"valueDifference":4}' },
    { label: "Example 2", input: '{"nums":[2,1],"indexDifference":0,"valueDifference":0}' },
    { label: "Example 3", input: '{"nums":[1,2,3],"indexDifference":2,"valueDifference":4}' },
  ],
};

export default function Problem2903Visualizer() {
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
            roleAt={(index) => (index === step.i ? "i" : "")}
          />
          <output aria-label="Pair state">
            {`i = ${step.i ?? "-"}, j = ${step.j ?? "-"}, result = ${JSON.stringify(step.result ?? run.result)}`}
          </output>
        </>
      )}
      renderReasoning={({ step }) => <p>{step.explanation}</p>}
    />
  );
}
