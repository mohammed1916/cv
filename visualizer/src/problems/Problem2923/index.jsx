import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import IndexedSequence from "../../components/shared/IndexedSequence";
import { code, python, parseInput, buildTrace } from "./algorithm";

const definition = {
  number: "2923",
  phases: [
    { id: "setup", label: "Setup", description: "Read the number of teams." },
    { id: "team", label: "Team", description: "Check one team's row." },
    { id: "compare", label: "Compare", description: "Count the wins over the other teams." },
    { id: "result", label: "Result", description: "Report the team that beats every other team." },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'JSON object with key grid (e.g. {"grid": [[0,1],[0,0]]})',
  url: "https://leetcode.com/problems/find-champion-i/",
  complexity: "O(n^2) time and O(n) space for n teams. The visualization caps the grid at 10 teams.",
  examples: [
    { label: "Example 1", input: '{"grid": [[0,1],[0,0]]}' },
    { label: "Example 2", input: '{"grid": [[0,0,1],[1,0,1],[0,0,0]]}' },
  ],
};

export default function Problem2923() {
  return <AlgorithmWorkspace
    definition={definition}
    renderVisual={({ step }) => <>
      <IndexedSequence label="wins per team" length={step.values.length} valueAt={i => String(step.values[i])}
        active={step.active} roleAt={i => step.marks[i] || ""} />
      <p>{step.summary}</p>
    </>}
    renderReasoning={({ step }) => <p>{step.message}</p>} />;
}
