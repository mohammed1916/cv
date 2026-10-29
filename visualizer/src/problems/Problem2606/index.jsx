import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import RecurrenceGrid from "../../components/shared/RecurrenceGrid";
import { code, python, pythonLineMap, parseInput, buildTrace } from "./algorithm";

const definition = {
  number: "2606",
  phases: [
    { id: "setup", label: "Setup", description: "Start with the empty substring." },
    { id: "scan", label: "Read", description: "Read a character and its cost." },
    { id: "compute", label: "Extend", description: "Extend or restart the substring ending here." },
    { id: "result", label: "Result", description: "Return the best cost." },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  pythonLineMap,
  inputLabel: "JSON object with keys s, chars, vals (e.g. {\"s\": \"adaa\", \"chars\": \"d\", \"vals\": [-1000]})",
  url: "https://leetcode.com/problems/find-the-substring-with-maximum-cost/",
  complexity: "O(n) time and O(1) extra space beyond the table, for string length n. The visualization caps s at 50 characters.",
  examples: [
    { label: "Example 1", input: "{\"s\": \"adaa\", \"chars\": \"d\", \"vals\": [-1000]}" },
    { label: "Example 2", input: "{\"s\": \"abc\", \"chars\": \"abc\", \"vals\": [-1, -1, -1]}" },
  ],
};

const cellText = value => Array.isArray(value) ? `{${value.join(", ")}}` : value === null || value === undefined ? "–" : String(value);

export default function Problem2606() {
  return <AlgorithmWorkspace
    definition={definition}
    renderVisual={({ run, step }) => <RecurrenceGrid
      rowLabels={run.rowLabels} columnLabels={run.columnLabels}
      row={step.row} column={step.column} label="DP table"
      valueAt={(r, c) => cellText(step.table[r][c])}
      roleAt={(r, c) => r === step.row && c === step.column ? "current" : step.table[r][c] !== null ? "filled" : ""} />}
    renderReasoning={({ step }) => <p>{step.message}</p>} />;
}
