import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import RecurrenceGrid from "../../components/shared/RecurrenceGrid";
import { code, python, pythonLineMap, parseInput, buildTrace } from "./algorithm";

const definition = {
  number: "2617",
  phases: [
    { id: "setup", label: "Setup", description: "Mark the start cell." },
    { id: "scan", label: "Scan", description: "Visit each cell in row-major order." },
    { id: "compute", label: "Relax", description: "Relax the distance from cells that can jump here." },
    { id: "result", label: "Result", description: "Return the distance to the bottom-right cell." },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  pythonLineMap,
  inputLabel: "JSON object with key grid, a rectangular matrix of non-negative integers (e.g. {\"grid\": [[2, 1, 0], [1, 0, 0]]})",
  url: "https://leetcode.com/problems/minimum-number-of-visited-cells-in-a-grid/",
  complexity: "O(m * n * (m + n)) in this visualization for grids up to 8 by 8; LeetCode allows up to 10^5 cells with a segment tree or union-find approach.",
  examples: [
    { label: "Example 1", input: "{\"grid\": [[3, 4, 2, 1], [4, 2, 3, 1], [2, 1, 0, 0], [2, 4, 0, 0]]}" },
    { label: "Example 2", input: "{\"grid\": [[3, 4, 2, 1], [4, 2, 1, 1], [2, 1, 1, 0], [3, 4, 1, 0]]}" },
    { label: "Example 3", input: "{\"grid\": [[2, 1, 0], [1, 0, 0]]}" },
    { label: 'Single cell', input: '{"grid":[[0]]}' },
    { label: 'Equal cells', input: '{"grid":[[2,2],[2,2]]}' },
    { label: 'Eight by eight limit values', input: '{"grid":[[99,0,99,0,99,0,99,0],[0,99,0,99,0,99,0,99],[99,0,99,0,99,0,99,0],[0,99,0,99,0,99,0,99],[99,0,99,0,99,0,99,0],[0,99,0,99,0,99,0,99],[99,0,99,0,99,0,99,0],[0,99,0,99,0,99,0,99]]}' },
    { label: 'Long run: eight by eight', input: '{"grid":[[52,95,94,49,0,7,10,53],[4,51,46,33,8,31,10,29],[48,11,54,89,40,59,98,33],[84,71,6,37,80,95,30,77],[92,27,94,97,96,51,34,25],[24,19,62,9,20,3,74,29],[64,71,18,41,64,39,26,1],[0,67,50,25,76,31,18,57]]}' },
  ],
};

const cellText = value => Array.isArray(value) ? `{${value.join(", ")}}` : value === null || value === undefined ? "–" : String(value);

export default function Problem2617() {
  return <AlgorithmWorkspace
    definition={definition}
    renderVisual={({ run, step }) => <RecurrenceGrid
      rowLabels={run.rowLabels} columnLabels={run.columnLabels}
      row={step.row} column={step.column} label="DP table"
      valueAt={(r, c) => cellText(step.table[r][c])}
      roleAt={(r, c) => r === step.row && c === step.column ? "current" : step.table[r][c] !== null ? "filled" : ""} />}
    renderReasoning={({ step }) => <p>{step.message}</p>} />;
}
