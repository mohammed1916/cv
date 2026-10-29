import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import IndexedSequence from "../../components/shared/IndexedSequence";
import { code, python, pythonLineMap, parseInput, buildTrace } from "./algorithm";

const definition = {
  number: "2448",
  phases: [
    { id: "setup", label: "Setup", description: "Start with no best cost." },
    { id: "candidate", label: "Candidate", description: "Pick a value from nums as the target." },
    { id: "reset", label: "Reset", description: "Start the total for this target at zero." },
    { id: "sum", label: "Sum", description: "Add the cost of moving each element to the target." },
    { id: "update", label: "Compare", description: "Keep the smaller total." },
    { id: "done", label: "Result", description: "Report the minimum total cost." },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  pythonLineMap,
  inputLabel: 'JSON {"nums": [1,3,5,2], "cost": [2,3,1,14]}',
  url: "https://leetcode.com/problems/minimum-cost-to-make-array-equal/",
  complexity: "O(n^2) time and O(1) extra space for n elements. The visualization caps n at 50.",
  examples: [{ label: "Example 1", input: '{"nums":[1,3,5,2],"cost":[2,3,1,14]}' }],
};

export default function MinimumCostEqualVisualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => (
        <>
          <IndexedSequence
            label="nums (candidate targets)"
            length={run.input.length}
            active={step.i ?? -1}
            valueAt={index => run.input[index]}
            roleAt={index => (index === step.i ? "target" : "")}
          />
          <IndexedSequence
            label="cost"
            length={run.cost.length}
            active={step.k ?? -1}
            valueAt={index => run.cost[index]}
            roleAt={index => (index === step.k ? "compared" : "")}
          />
          <p>Target: {step.target ?? "none"} · Total: {step.total} · Best: {step.best ?? "none yet"}</p>
        </>
      )}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  );
}
