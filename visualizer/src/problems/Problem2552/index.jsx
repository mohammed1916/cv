import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import RecurrenceGrid from "../../components/shared/RecurrenceGrid";
import { code, python, pythonLineMap, parseInput, buildTrace } from "./algorithm";

const definition = {
  number: "2552",
  phases: [
    { id: "setup", label: "Setup", description: "Start the total at zero." },
    { id: "scan", label: "Pairs", description: "Check each middle pair (j, k)." },
    { id: "compute", label: "Count", description: "Multiply left and right choices for valid pairs." },
    { id: "result", label: "Result", description: "Return the total." },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  pythonLineMap,
  inputLabel: "JSON object with key nums, a permutation of 1..n (e.g. {\"nums\": [1, 3, 2, 4, 5]})",
  url: "https://leetcode.com/problems/count-increasing-quadruplets/",
  complexity: "O(n^3) in this visualization for n up to 12; the standard solution is O(n^2) with a Fenwick tree (LeetCode allows n up to 4000).",
  examples: [
    { label: "Example 1", input: "{\"nums\": [1, 3, 2, 4, 5]}" },
    { label: "Example 2", input: "{\"nums\": [1, 2, 3, 4]}" },
  ],
};

const cellText = value => Array.isArray(value) ? `{${value.join(", ")}}` : value === null || value === undefined ? "–" : String(value);

export default function Problem2552() {
  return <AlgorithmWorkspace
    definition={definition}
    renderVisual={({ run, step }) => <RecurrenceGrid
      rowLabels={run.rowLabels} columnLabels={run.columnLabels}
      row={step.row} column={step.column} label="DP table"
      valueAt={(r, c) => cellText(step.table[r][c])}
      roleAt={(r, c) => r === step.row && c === step.column ? "current" : step.table[r][c] !== null ? "filled" : ""} />}
    renderReasoning={({ step }) => <p>{step.message}</p>} />;
}
