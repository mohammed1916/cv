import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import RecurrenceGrid from "../../components/shared/RecurrenceGrid";
import { code, python, parseInput, buildTrace } from "./algorithm";

const definition = {
  number: "2911",
  phases: [
    { id: "setup", label: "Setup", description: "Start the DP table with zero parts ending at zero." },
    { id: "row", label: "Parts", description: "Fill the row for each number of parts." },
    { id: "cost", label: "Cost", description: "Price the substring from start to end as a semi-palindrome." },
    { id: "update", label: "Update", description: "Keep the cheapest candidate for this cell." },
    { id: "result", label: "Result", description: "Report the minimum total changes." },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'JSON object with keys s and k (e.g. {"s": "abcac", "k": 2})',
  url: "https://leetcode.com/problems/minimum-changes-to-make-k-semi-palindromes/",
  complexity: "O(n^3) time and O(n*k) space for string length n, with the semi-palindrome cost computed per substring. Visualization caps s at 12 characters. Constraints are paraphrased from a mirror, so the statement is not verified.",
  examples: [
    { label: "Example 1", input: '{"s": "abcac", "k": 2}' },
    { label: "Example 2", input: '{"s": "abcdef", "k": 2}' },
    { label: "Example 3", input: '{"s": "aabbaa", "k": 3}' },
  ],
};

const cellText = value => (value === null || value === undefined ? "∞" : String(value));

export default function Problem2911() {
  return <AlgorithmWorkspace
    definition={definition}
    renderVisual={({ run, step }) => <>
      <RecurrenceGrid rowLabels={run.rowLabels} columnLabels={run.columnLabels}
        row={step.row} column={step.column} label="DP table: parts (rows) by end index (columns)"
        valueAt={(r, c) => cellText(step.table[r][c])}
        roleAt={(r, c) => (r === step.row && c === step.column ? "current" : step.table[r][c] !== null ? "filled" : "")} />
      <p>{step.message}</p>
    </>}
    renderReasoning={({ step }) => <p>{step.message}</p>} />;
}
