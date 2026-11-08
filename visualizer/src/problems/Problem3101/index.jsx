import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import RecurrenceGrid from "../../components/shared/RecurrenceGrid";
import IndexedSequence from "../../components/shared/IndexedSequence";
import { code, python, pythonLineMap, parseInput, buildTrace } from "./algorithm";

const definition = {
  number: "3101",
  phases: [
    { id: "setup", label: "Setup", description: "Start with empty totals." },
    { id: "scan", label: "Scan", description: "Visit the next index." },
    { id: "compute", label: "Streak", description: "Update the run length and the running total." },
    { id: "result", label: "Result", description: "Return the total." },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  pythonLineMap,
  inputLabel: "JSON object with key nums, a binary array (e.g. {\"nums\": [0, 1, 1, 1]})",
  url: "https://leetcode.com/problems/count-alternating-subarrays/",
  complexity: "O(n) time and O(1) extra space; the table here keeps the run per index for display (n up to 50).",
  examples: [
    { label: "Example 1", input: "{\"nums\": [0, 1, 0, 0, 1]}" },
    { label: "Example 2", input: "{\"nums\": [1, 1, 0, 1, 0, 1]}" },
    { label: "Single zero", input: "{\"nums\":[0]}" },
    { label: "Single one", input: "{\"nums\":[1]}" },
    { label: "Equal values", input: "{\"nums\":[1,1,1,1]}" },
    { label: "Longest allowed: 50 values", input: "{\"nums\":[1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0]}" },
    { label: "Long run: 50 random values", input: "{\"nums\":[0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1]}" },
  ],
};

const cellText = value => Array.isArray(value) ? `{${value.join(", ")}}` : value === null || value === undefined ? "–" : String(value);

export default function Problem3101() {
  return <AlgorithmWorkspace
    definition={definition}
    renderVisual={({ run, step }) => <>
      <IndexedSequence label="nums (l and r bound the current alternating run)" length={run.input.nums.length} active={step.right} valueAt={i => run.input.nums[i]} roleAt={i => i === step.left ? "l" : i === step.right ? "r" : i > step.left && i < step.right ? "window" : ""} />
      <RecurrenceGrid
      rowLabels={run.rowLabels} columnLabels={run.columnLabels}
      row={step.row} column={step.column} label="DP table"
      valueAt={(r, c) => cellText(step.table[r][c])}
      roleAt={(r, c) => r === step.row && c === step.column ? "current" : step.table[r][c] !== null ? "filled" : ""} />
    </>}
    renderReasoning={({ step }) => <p>{step.message}</p>} />;
}
