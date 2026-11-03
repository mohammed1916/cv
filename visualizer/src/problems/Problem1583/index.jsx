import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import IndexedSequence from "../../components/shared/IndexedSequence";
import { code, python, pythonLineMap, parseInput, buildTrace, phases } from "./algorithm";

const definition = {
  number: "1583",
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  pythonLineMap,
  inputLabel: 'Input JSON: {"n", "preferences", "pairs"}',
  url: "https://leetcode.com/problems/count-unhappy-friends/",
  complexity: "O(n^2) time and O(n^2) space for n friends. The visualization caps n at 40.",
  examples: [
    { label: "Sample A", input: JSON.stringify({ n: 4, preferences: [[2, 1, 3], [2, 0, 3], [0, 1, 3], [0, 1, 2]], pairs: [[0, 1], [2, 3]] }) },
    { label: "Two friends", input: JSON.stringify({ n: 2, preferences: [[1], [0]], pairs: [[0, 1]] }) },
    { label: "Four friends", input: JSON.stringify({ n: 4, preferences: [[3, 1, 2], [0, 2, 3], [1, 0, 3], [2, 1, 0]], pairs: [[0, 3], [1, 2]] }) },
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
          active={step.snapshot.x}
          valueAt={index => `with ${step.snapshot.partner[index]}`}
          roleAt={index => (index === step.snapshot.u ? "candidate" : step.snapshot.unhappy[index] ? "unhappy" : "")}
        />
      )}
      renderReasoning={({ run, step }) => (
        <p>{`Unhappy friends found so far: ${step.snapshot.unhappy.filter(Boolean).length} of ${run.input.n}.`}</p>
      )}
    />
  );
}
