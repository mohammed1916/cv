import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import RecurrenceGrid from "../../components/shared/RecurrenceGrid";
import { code, python, pythonLineMap, parseInput, buildTrace } from "./algorithm";

const definition = {
  number: "2750",
  phases: [
    { id: "setup", label: "Setup", description: "Initialize the DP table." },
    { id: "loop", label: "Prefix", description: "Pick the prefix length i." },
    { id: "check", label: "Check", description: "Test whether nums[j..i-1] has exactly one 1." },
    { id: "result", label: "Result", description: "Return the count mod 1e9+7." },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  pythonLineMap,
  inputLabel: "JSON object with key nums, a binary array (e.g. {\"nums\": [0, 1, 0, 0, 1]})",
  url: "https://leetcode.com/problems/ways-to-split-array-into-good-subarrays/",
  complexity: "O(n^2) in this visualization for n up to 50; the standard solution is O(n) using positions of 1s.",
  examples: [
    { label: "Example 1", input: "{\"nums\": [0, 1, 0, 0, 1]}" },
    { label: "Example 2", input: "{\"nums\": [0, 1, 0]}" },
  ],
};

const cellText = value => Array.isArray(value) ? `{${value.join(", ")}}` : value === null || value === undefined ? "–" : String(value);

export default function Problem2750() {
  return <AlgorithmWorkspace
    definition={definition}
    renderVisual={({ run, step }) => <RecurrenceGrid
      rowLabels={run.rowLabels} columnLabels={run.columnLabels}
      row={step.row} column={step.column} label="DP table"
      valueAt={(r, c) => cellText(step.table[r][c])}
      roleAt={(r, c) => r === step.row && c === step.column ? "current" : step.table[r][c] !== null ? "filled" : ""} />}
    renderReasoning={({ step }) => <p>{step.message}</p>} />;
}
