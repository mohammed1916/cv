import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import RecurrenceGrid from "../../components/shared/RecurrenceGrid";
import { code, python, pythonLineMap, parseInput, buildTrace } from "./algorithm";

const definition = {
  number: "2963",
  phases: [
    { id: "setup", label: "Setup", description: "Record first and last positions of each value." },
    { id: "loop", label: "Prefix", description: "Pick the prefix length i." },
    { id: "check", label: "Check", description: "Test whether the segment nums[j..i-1] is closed." },
    { id: "result", label: "Result", description: "Return the count mod 1e9+7." },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  pythonLineMap,
  inputLabel: "JSON object with key nums, positive integers (e.g. {\"nums\": [1, 2, 1, 3]})",
  url: "https://leetcode.com/problems/count-the-number-of-good-partitions/",
  complexity: "O(n^2) in this visualization for n up to 50; the standard solution counts segments k and returns 2^(k-1) in O(n).",
  examples: [
    { label: "Example 1", input: "{\"nums\": [1, 2, 3, 4]}" },
    { label: "Example 2", input: "{\"nums\": [1, 1, 1, 1]}" },
    { label: "Example 3", input: "{\"nums\": [1, 2, 1, 3]}" },
  ],
};

const cellText = value => Array.isArray(value) ? `{${value.join(", ")}}` : value === null || value === undefined ? "–" : String(value);

export default function Problem2963() {
  return <AlgorithmWorkspace
    definition={definition}
    renderVisual={({ run, step }) => <RecurrenceGrid
      rowLabels={run.rowLabels} columnLabels={run.columnLabels}
      row={step.row} column={step.column} label="DP table"
      valueAt={(r, c) => cellText(step.table[r][c])}
      roleAt={(r, c) => r === step.row && c === step.column ? "current" : step.table[r][c] !== null ? "filled" : ""} />}
    renderReasoning={({ step }) => <p>{step.message}</p>} />;
}
