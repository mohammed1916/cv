import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import IndexedSequence from "../../components/shared/IndexedSequence";
import { code, python, pythonLineMap, parseInput, buildTrace } from "./algorithm";

const definition = {
  number: "1583",
  phases: [
    { id: "setup", label: "Setup", description: "Build the partner map and the rank table." },
    { id: "scan", label: "Scan", description: "Visit each friend in order." },
    { id: "check", label: "Check", description: "Test candidates ranked above the current partner." },
    { id: "record", label: "Record", description: "Mark a friend unhappy when a candidate prefers them." },
    { id: "done", label: "Result", description: "Report the number of unhappy friends." },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  pythonLineMap,
  inputLabel: 'Input JSON: {"n", "preferences", "pairs"}',
  url: "https://leetcode.com/problems/count-unhappy-friends/",
  complexity: "O(n^2) time and O(n^2) space for n friends. The visualization caps n at 40.",
  examples: [
    { label: "Example 1", input: JSON.stringify({ n: 4, preferences: [[1, 2, 3], [3, 2, 0], [3, 1, 0], [1, 2, 0]], pairs: [[0, 1], [2, 3]] }) },
    { label: "Example 2", input: JSON.stringify({ n: 2, preferences: [[1], [0]], pairs: [[1, 0]] }) },
    { label: "Example 3", input: JSON.stringify({ n: 4, preferences: [[1, 3, 2], [2, 3, 0], [1, 3, 0], [0, 2, 1]], pairs: [[1, 3], [0, 2]] }) },
  ],
};

export default function CountUnhappyFriendsVisualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => (
        <IndexedSequence
          label={`Friends (n = ${run.input.n}); each cell shows the current partner`}
          length={run.input.n}
          active={step.x}
          valueAt={index => `with ${step.partner[index]}`}
          roleAt={index => (index === step.u ? "candidate" : step.unhappy[index] ? "unhappy" : "")}
        />
      )}
      renderReasoning={({ run, step }) => (
        <p>{`Unhappy friends found so far: ${step.unhappy.filter(Boolean).length} of ${run.input.n}.`}</p>
      )}
    />
  );
}
