import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import IndexedSequence from "../../components/shared/IndexedSequence";
import { code, python, parseInput, buildTrace } from "./algorithm";

const definition = {
  number: "2905",
  phases: [
    { id: "setup", label: "Setup", description: "Start the tracked minimum and maximum at index 0." },
    { id: "loop", label: "Advance", description: "Bring index i = j - indexDifference into range." },
    { id: "track", label: "Track", description: "Update the tracked minimum and maximum indices." },
    { id: "check", label: "Check", description: "Test both extremes against nums[j]." },
    { id: "done", label: "Result", description: "Report the pair or [-1, -1]." },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'JSON {"nums":[...],"indexDifference":2,"valueDifference":4}',
  url: "https://leetcode.com/problems/find-indices-with-index-and-value-difference-ii/",
  complexity: "O(n) time and O(1) space. The visualization caps nums at 100 values and values at 1000.",
  examples: [
    { label: "Example 1", input: '{"nums":[5,1,4,1],"indexDifference":2,"valueDifference":4}' },
    { label: "Example 2", input: '{"nums":[2,1],"indexDifference":0,"valueDifference":0}' },
    { label: "Example 3", input: '{"nums":[1,2,3],"indexDifference":2,"valueDifference":4}' },
  ],
};

export default function Problem2905Visualizer() {
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
            roleAt={(index) => (index === step.mn ? "min" : index === step.mx ? "max" : index === step.i ? "i" : "")}
          />
          <output aria-label="Tracked extremes">
            {`j = ${step.j ?? "-"}, min index ${step.mn}, max index ${step.mx}, result = ${JSON.stringify(step.result ?? run.result)}`}
          </output>
        </>
      )}
      renderReasoning={({ step }) => <p>{step.explanation}</p>}
    />
  );
}
