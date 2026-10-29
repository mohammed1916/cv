import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import RecurrenceGrid from "../../components/shared/RecurrenceGrid";
import { code, python, pythonLineMap, parseInput, buildTrace } from "./algorithm";

const definition = {
  number: "2745",
  phases: [
    { id: "setup", label: "Setup", description: "Start from the empty string." },
    { id: "scan", label: "Visit", description: "Visit the next (AA, BB) count pair." },
    { id: "compute", label: "Extend", description: "Try appending AA, BB and AB blocks." },
    { id: "result", label: "Result", description: "Return the longest length." },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  pythonLineMap,
  inputLabel: "JSON object with keys x, y, z (e.g. {\"x\": 2, \"y\": 5, \"z\": 1})",
  url: "https://leetcode.com/problems/construct-the-longest-new-string/",
  complexity: "O(x * y) states with O(1) transitions here, plus the AB fill; the closed form 2 * (2 * min(x, y) + z) + (2 if x != y else 0) gives the same answer.",
  examples: [
    { label: "Example 1", input: "{\"x\": 2, \"y\": 5, \"z\": 1}" },
    { label: "Example 2", input: "{\"x\": 3, \"y\": 2, \"z\": 2}" },
  ],
};

const cellText = value => Array.isArray(value) ? `{${value.join(", ")}}` : value === null || value === undefined ? "–" : String(value);

export default function Problem2745() {
  return <AlgorithmWorkspace
    definition={definition}
    renderVisual={({ run, step }) => <RecurrenceGrid
      rowLabels={run.rowLabels} columnLabels={run.columnLabels}
      row={step.row} column={step.column} label="DP table"
      valueAt={(r, c) => cellText(step.table[r][c])}
      roleAt={(r, c) => r === step.row && c === step.column ? "current" : step.table[r][c] !== null ? "filled" : ""} />}
    renderReasoning={({ step }) => <p>{step.message}</p>} />;
}
