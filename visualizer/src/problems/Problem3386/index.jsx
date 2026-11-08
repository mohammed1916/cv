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
    { label: "Four presses", input: '{"events": [[4,3],[2,8],[4,12],[1,14]]}' },
    { label: "Tie on time", input: '{"events": [[5,4],[2,6],[3,8]]}' },
    { label: "Single press", input: '{"events": [[0,1]]}' },
    { label: 'Same button repeated', input: '{"events":[[3,1],[3,2],[3,3]]}' },
    { label: 'Large time values', input: '{"events":[[0,1000000],[7,1000001]]}' },
    { label: 'Long run: 40 presses', input: '{"events":[[6,2],[5,7],[9,8],[6,11],[1,13],[0,16],[9,17],[6,20],[5,23],[0,27],[5,30],[4,35],[8,38],[2,39],[1,40],[0,44],[5,47],[6,48],[6,52],[1,55],[8,56],[6,61],[9,65],[7,68],[2,72],[0,76],[8,77],[8,80],[1,84],[7,86],[2,87],[6,88],[1,91],[2,93],[2,97],[9,100],[4,105],[7,106],[6,109],[5,114]]}' },
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
