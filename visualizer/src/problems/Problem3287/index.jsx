import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import RecurrenceGrid from "../../components/shared/RecurrenceGrid";
import { code, python, pythonLineMap, parseInput, buildTrace } from "./algorithm";

const definition = {
  number: "3287",
  phases: [
    { id: "setup", label: "Setup", description: "Start the prefix table." },
    { id: "prefix", label: "Prefix", description: "Extend OR sets from the left." },
    { id: "suffix", label: "Suffix", description: "Build matching OR sets from the right." },
    { id: "combine", label: "Combine", description: "Try each split point." },
    { id: "result", label: "Result", description: "Return the maximum value." },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  pythonLineMap,
  inputLabel: "JSON object with keys nums and k (e.g. {\"nums\": [4, 2, 5, 6, 7], \"k\": 2})",
  url: "https://leetcode.com/problems/find-the-maximum-sequence-value-of-array/",
  complexity: "O(n * k * 32) set work with 5-bit OR values here, for n up to 20 in the visualization (LeetCode allows n up to 400).",
  examples: [
    { label: "Example 1", input: "{\"nums\": [4, 2, 5, 6, 7], \"k\": 2}" },
    { label: "Check case", input: "{\"nums\": [2, 6, 7], \"k\": 1}" },
  ],
};

const cellText = value => Array.isArray(value) ? `{${value.join(", ")}}` : value === null || value === undefined ? "–" : String(value);

export default function Problem3287() {
  return <AlgorithmWorkspace
    definition={definition}
    renderVisual={({ run, step }) => <RecurrenceGrid
      rowLabels={run.rowLabels} columnLabels={run.columnLabels}
      row={step.row} column={step.column} label="DP table"
      valueAt={(r, c) => cellText(step.table[r][c])}
      roleAt={(r, c) => r === step.row && c === step.column ? "current" : step.table[r][c] !== null ? "filled" : ""} />}
    renderReasoning={({ step }) => <p>{step.message}</p>} />;
}
