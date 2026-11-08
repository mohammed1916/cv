import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import RecurrenceGrid from "../../components/shared/RecurrenceGrid";
import IndexedSequence from "../../components/shared/IndexedSequence";
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
  complexity: "O(n^3) time and O(n*k) space for string length n, with the semi-palindrome cost computed per substring. The visualization caps s at 12 characters.",
  examples: [
    { label: 'Six letters, two parts', input: '{"s":"xyzxzy","k":2}' },
    { label: 'Eight letters, four parts', input: '{"s":"mnopqrst","k":4}' },
    { label: 'Repeated letter, one part', input: '{"s":"rrrr","k":1}' },
    { label: "Two letters, k = 1", input: "{\"s\":\"ab\",\"k\":1}" },
    { label: "All letters equal, k = 2", input: "{\"s\":\"aaaa\",\"k\":2}" },
    { label: "Longest string, k = 6", input: "{\"s\":\"abcabcabcabc\",\"k\":6}" },
    { label: "Long run: 12 letters", input: "{\"s\":\"jiakmfcojvpf\",\"k\":4}" },
  ],
};

const cellText = value => (value === null || value === undefined ? "∞" : String(value));

export default function Problem2911() {
  return <AlgorithmWorkspace
    definition={definition}
    renderVisual={({ run, step }) => <>
      <IndexedSequence label="s (the piece being priced runs from l to r)" length={run.input.s.length} valueAt={i => run.input.s[i]}
        active={-1} roleAt={i => (step.start !== null && step.start !== undefined && i === step.start ? "l" : step.column > 0 && i === step.column - 1 ? "r" : step.start !== null && step.start !== undefined && i > step.start && i < step.column - 1 ? "inside" : "")} />
      <RecurrenceGrid rowLabels={run.rowLabels} columnLabels={run.columnLabels}
        row={step.row} column={step.column} label="DP table: parts (rows) by end index (columns)"
        valueAt={(r, c) => cellText(step.table[r][c])}
        roleAt={(r, c) => (r === step.row && c === step.column ? "current" : step.table[r][c] !== null ? "filled" : "")} />
      <p>{step.message}</p>
    </>}
    renderReasoning={({ step }) => <p>{step.message}</p>} />;
}
