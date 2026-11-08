import IndexedSequence from "../../components/shared/IndexedSequence";
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
    { label: 'Single value', input: '{"nums":[7]}' },
    { label: 'Equal values', input: '{"nums":[2,2,2]}' },
    { label: 'Large values', input: '{"nums":[1000,999,1000,1]}' },
    { label: 'Long run: 50 values', input: '{"nums":[28,11,10,8,21,11,3,17,20,25,23,3,21,14,28,15,20,17,4,13,16,17,12,6,19,9,3,19,16,5,30,2,22,5,16,14,28,3,6,2,19,4,3,11,17,5,12,1,24,5]}' },
  ],
};

const cellText = value => Array.isArray(value) ? `{${value.join(", ")}}` : value === null || value === undefined ? "–" : String(value);

export default function Problem2963() {
  return <AlgorithmWorkspace
    definition={definition}
    renderVisual={({ run, step }) => <>
      <IndexedSequence label="nums (segment l..r is the piece being tested)" length={run.input.nums.length}
        valueAt={i => String(run.input.nums[i])} active={step.r ?? -1}
        roleAt={i => step.l !== null && step.l !== undefined && i === step.l ? "l" : i === step.r ? "r" : step.l !== null && step.l !== undefined && i > step.l && i < step.r ? "window" : ""} />
      <RecurrenceGrid
      rowLabels={run.rowLabels} columnLabels={run.columnLabels}
      row={step.row} column={step.column} label="DP table"
      valueAt={(r, c) => cellText(step.table[r][c])}
      roleAt={(r, c) => r === step.row && c === step.column ? "current" : step.table[r][c] !== null ? "filled" : ""} />
    </>}
    renderReasoning={({ step }) => <p>{step.message}</p>} />;
}
