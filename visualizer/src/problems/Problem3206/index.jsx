import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import IndexedSequence from "../../components/shared/IndexedSequence";
import { code, python, parseInput, buildTrace } from "./algorithm";

const definition = {
  number: 3206,
  phases: [
    { id: "setup", label: "Setup", description: "Read the circle size and start the count." },
    { id: "scan", label: "Window", description: "Look at a tile and its two neighbours." },
    { id: "check", label: "Check", description: "Test whether the middle tile alternates." },
    { id: "done", label: "Result", description: "Return the number of alternating groups." },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'JSON: {"colors": [0,1,0,0,1]}',
  url: "https://leetcode.com/problems/alternating-groups-i/",
  complexity: "O(n) time and O(1) extra space for n tiles on the circle. The visualization caps n at 100.",
  examples: [
    { label: "Example 1", input: '{"colors":[1,1,1]}' },
    { label: "Example 2", input: '{"colors":[0,1,0,0,1]}' },
  ],
};

export default function AlternatingGroupsVisualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => (
        <>
          <IndexedSequence label="Tiles on the circle" length={run.input.colors.length}
            valueAt={i => (run.input.colors[i] === 1 ? "B" : "R")}
            active={step.index} roleAt={i => (i === step.index ? "active" : step.window.includes(i) ? "window" : "")} />
          <p>Alternating groups so far: {step.count}</p>
        </>
      )}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  );
}
