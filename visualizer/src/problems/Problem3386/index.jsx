import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import IndexedSequence from "../../components/shared/IndexedSequence";
import { code, python, parseInput, buildTrace } from "./algorithm";

const definition = {
  number: "3386",
  phases: [
    { id: "setup", label: "Setup", description: "Start with no best button." },
    { id: "scan", label: "Scan", description: "Read the next press event." },
    { id: "measure", label: "Measure", description: "Compute its push time." },
    { id: "compare", label: "Compare", description: "Keep the longer push, or the smaller index on a tie." },
    { id: "done", label: "Result", description: "Return the best button index." },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'JSON object: {"events": [[1,2],[2,5],[3,9],[1,15]]}',
  url: "https://leetcode.com/problems/button-with-longest-push-time/",
  complexity: "O(n) time and O(1) extra space for n events. The visualization accepts at most 40 events.",
  examples: [
    { label: "Sourced example 1", input: '{"events": [[1,2],[2,5],[3,9],[1,15]]}' },
    { label: "Sourced example 2", input: '{"events": [[10,5],[1,7]]}' },
  ],
};

export default function Problem3386Visualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => (
        <>
          <IndexedSequence label="Push time of each event" length={run.input.events.length}
            valueAt={index => (step.durations[index] ?? "-")} active={step.position}
            roleAt={index => (index < step.durations.length && index === step.position ? "measured" : "")} />
          <p>Best button so far: {step.best === null || step.best < 0 ? "none" : step.best}</p>
        </>
      )}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  );
}
