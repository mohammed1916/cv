import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import RemovalLanesView from "./RemovalLanesView";
import { code, python, parseInput, buildTrace } from "./algorithm.js";

const phases = [
  { id: "start", label: "Start", description: "Nothing removed yet: the whole array is open." },
  { id: "query", label: "Query", description: "Take the next query value in order." },
  { id: "front", label: "Front", description: "Remove the earliest open value that qualifies." },
  { id: "back", label: "Back", description: "Remove the latest open value that qualifies." },
  { id: "advance", label: "Advance", description: "Keep every surviving state for the next query." },
  { id: "stop", label: "Stop", description: "No state can remove an endpoint." },
  { id: "done", label: "Result", description: "Report how many queries were processed." },
];

const definition = {
  number: "3018",
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Object with nums and queries (integers from 1 to 9, up to 8 each)',
  url: "https://leetcode.com/problems/maximum-number-of-removal-queries-that-can-be-processed-i/",
  complexity: "O(m * n^2) time in this layered search for m queries and n numbers, since each query layer may branch from every front index; O(n) states per layer. The visualization caps both lists at 8 values.",
  examples: [
    { label: "Both ends help", input: '{"nums":[1,3,2,5,4],"queries":[2,3,1,4]}' },
    { label: "Blocked early", input: '{"nums":[2,1,3],"queries":[5,1]}' },
    { label: "Full run", input: '{"nums":[4,2,6,1,5],"queries":[1,2,4,3]}' },
    { label: "Single pair", input: '{"nums":[1],"queries":[1]}' },
    { label: "Equal values", input: '{"nums":[3,3,3],"queries":[3,3]}' },
    { label: "Largest values", input: '{"nums":[9,9,9,9,9,9,9,9],"queries":[9,9,9,9,9,9,9,9]}' },
    { label: "Long run: 8 each", input: '{"nums":[1,3,6,4,6,6,2,9],"queries":[4,6,7,5,8,2,2,7]}' },
  ],
};

export default function Problem3018Visualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <RemovalLanesView run={run} step={step} />}
      renderReasoning={({ step }) => (
        <p>{step.message}</p>
      )}
    />
  );
}
