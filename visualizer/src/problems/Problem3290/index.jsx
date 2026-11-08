import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import RecurrenceGrid from "../../components/shared/RecurrenceGrid";
import IndexedSequence from "../../components/shared/IndexedSequence";
import { code, python, pythonLineMap, parseInput, buildTrace } from "./algorithm";

const definition = {
  number: "3290",
  phases: [
    { id: "setup", label: "Setup", description: "Fill the zero-pick row." },
    { id: "skip", label: "Skip", description: "Carry the best score without taking b[j-1]." },
    { id: "take", label: "Take", description: "Take b[j-1] as the next pick." },
    { id: "result", label: "Result", description: "Return the best score with 4 picks." },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  pythonLineMap,
  inputLabel: "JSON object with keys a (length 4) and b (e.g. {\"a\": [3, 2, 5, 6], \"b\": [2, -6, 4, -5, -3, 2, -7]})",
  url: "https://leetcode.com/problems/maximum-multiplication-score/",
  complexity: "O(4 * n) time with a 5 by (n + 1) table, for n up to 20 in the visualization.",
  examples: [
    { label: "Invented sequence", input: "{\"a\": [1, -2, 3, 4], \"b\": [5, -1, 2, -3, 4, 6]}" },
    { label: "Example 2", input: "{\"a\": [-1, 4, 5, -2], \"b\": [-5, -1, -3, -2, -4]}" },
    { label: 'Smallest b', input: '{"a":[1,2,3,4],"b":[4,3,2,1]}' },
    { label: 'Equal values', input: '{"a":[-1,-1,-1,-1],"b":[-1,-1,-1,-1]}' },
    { label: 'Largest b, extreme values', input: '{"a":[100,-100,100,-100],"b":[100,-100,100,-100,100,-100,100,-100,100,-100,100,-100,100,-100,100,-100,100,-100,100,-100]}' },
    { label: 'Long run: 20 generated values in b', input: '{"a":[-60,-70,-37,-36],"b":[2,-70,-56,96,96,96,-84,27,-8,-1,-71,-2,40,-25,-86,-65,-49,39,76,-31]}' },
  ],
};

const cellText = value => Array.isArray(value) ? `{${value.join(", ")}}` : value === null || value === undefined ? "–" : String(value);

export default function Problem3290() {
  return <AlgorithmWorkspace
    definition={definition}
    renderVisual={({ run, step }) => <>
      <IndexedSequence label="b (columns of the table)" length={run.input.b.length} active={step.column - 1}
        valueAt={index => run.input.b[index]}
        roleAt={index => (step.column - 1 === index ? "current" : index < step.column - 1 ? "earlier" : "")} />
      <RecurrenceGrid
      rowLabels={run.rowLabels} columnLabels={run.columnLabels}
      row={step.row} column={step.column} label="DP table"
      valueAt={(r, c) => cellText(step.table[r][c])}
      roleAt={(r, c) => r === step.row && c === step.column ? "current" : step.table[r][c] !== null ? "filled" : ""} />
    </>}
    renderReasoning={({ step }) => <p>{step.message}</p>} />;
}
