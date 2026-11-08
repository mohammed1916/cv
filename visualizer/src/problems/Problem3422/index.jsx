import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import MedianWindowView from "./MedianWindowView";
import { code, python, parseInput, buildTrace } from "./algorithm.js";

const definition = {
  number: "3422",
  phases: [
    { id: "start", label: "Setup", description: "No window has been costed yet." },
    { id: "window", label: "Window", description: "Take the next k consecutive values." },
    { id: "median", label: "Median", description: "The middle sorted value is the target." },
    { id: "cost", label: "Cost", description: "Add each distance to the target." },
    { id: "record", label: "Record", description: "This window beats the best so far." },
    { id: "skip", label: "Skip", description: "This window does not beat the best." },
    { id: "done", label: "Result", description: "Report the cheapest window." },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Object with nums and k (e.g. {"nums":[1,3,6],"k":2})',
  url: "https://leetcode.com/problems/minimum-operations-to-make-subarray-elements-equal/",
  complexity: "O(n * k log k) time with a sort per window and O(k) extra space for the sorted copy. A sliding sorted structure would be faster; this view keeps each window explicit. The visualization caps nums at 12 digits.",
  examples: [
    { label: "Spread values", input: '{"nums":[1,3,6,2,8,5],"k":3}' },
    { label: "Already equal", input: '{"nums":[4,4,4,4],"k":2}' },
    { label: "One window", input: '{"nums":[9,1,5,2],"k":4}' },
    { label: 'Single value', input: '{"nums":[5],"k":1}' },
    { label: 'Equal pairs tie', input: '{"nums":[2,2,7,7],"k":2}' },
    { label: 'Alternating extremes', input: '{"nums":[0,9,0,9,0,9,0,9,0,9,0,9],"k":6}' },
    { label: 'Long run: 12 digits', input: '{"nums":[0,2,6,1,4,3,9,4,7,2,8,4],"k":5}' },
  ],
};

export default function Problem3422Visualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <MedianWindowView run={run} step={step} />}
      renderReasoning={({ run, step }) => (
        <p>
          {step.phase === "done"
            ? `The cheapest window costs ${run.result} operations.`
            : "The sum of distances to a value is smallest when the value is a median, so the middle of the sorted window is the target."}
        </p>
      )}
    />
  );
}
