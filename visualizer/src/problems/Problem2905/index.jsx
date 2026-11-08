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
    { label: "Two values, smallest difference", input: "{\"nums\":[1,2],\"indexDifference\":0,\"valueDifference\":1}" },
    { label: "Equal values", input: "{\"nums\":[7,7],\"indexDifference\":1,\"valueDifference\":0}" },
    { label: "Largest gap at the far ends", input: "{\"nums\":[50,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,0],\"indexDifference\":99,\"valueDifference\":50}" },
    { label: "Long run: 100 values", input: "{\"nums\":[18,39,45,10,23,36,25,3,16,23,44,5,20,46,15,26,31,23,39,37,6,28,21,28,2,37,1,49,3,21,16,33,40,48,18,10,48,4,49,10,7,23,9,33,25,29,17,40,30,7,42,48,21,5,48,50,12,23,27,33,35,43,44,36,22,24,17,50,8,41,41,7,43,3,34,20,24,34,47,10,37,49,45,27,14,43,20,31,31,10,23,42,40,22,44,27,11,12,5,33],\"indexDifference\":10,\"valueDifference\":25}" },
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
            roleAt={(index) => (index === step.j ? "j" : index === step.i ? "i" : index === step.mn ? "min" : index === step.mx ? "max" : "")}
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
