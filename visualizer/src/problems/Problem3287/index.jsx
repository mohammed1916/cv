import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import RecurrenceGrid from "../../components/shared/RecurrenceGrid";
import IndexedSequence from "../../components/shared/IndexedSequence";
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
    { label: "Invented four values", input: "{\"nums\": [3, 9, 12, 5], \"k\": 1}" },
    { label: "Invented six values", input: "{\"nums\": [1, 8, 2, 4, 16, 3], \"k\": 2}" },
    { label: 'Two values', input: '{"nums":[1,2],"k":1}' },
    { label: 'Equal values', input: '{"nums":[7,7,7,7],"k":2}' },
    { label: 'Largest k for twenty values', input: '{"nums":[26,1,26,1,26,1,26,1,26,1,26,1,26,1,26,1,26,1,26,1],"k":10}' },
    { label: 'Long run: twenty generated values', input: '{"nums":[5,14,15,18,5,8,15,18,7,20,19,16,1,12,13,22,5,6,21,24],"k":6}' },
  ],
};

const cellText = value => Array.isArray(value) ? `{${value.join(", ")}}` : value === null || value === undefined ? "–" : String(value);

export default function Problem3287() {
  return <AlgorithmWorkspace
    definition={definition}
    renderVisual={({ run, step }) => <>
      <IndexedSequence label="nums: first half and second half" length={run.input.nums.length}
        active={step.phase === "combine" ? step.column : -1}
        valueAt={index => run.input.nums[index]}
        roleAt={index => step.phase === "combine" || step.phase === "result" ? (index < step.column ? "first half" : "second half") : step.phase === "prefix" ? (index < step.column ? "prefix" : "") : ""} />
      <RecurrenceGrid
      rowLabels={run.rowLabels} columnLabels={run.columnLabels}
      row={step.row} column={step.column} label="DP table"
      valueAt={(r, c) => cellText(step.table[r][c])}
      roleAt={(r, c) => r === step.row && c === step.column ? "current" : step.table[r][c] !== null ? "filled" : ""} />
    </>}
    renderReasoning={({ step }) => <p>{step.message}</p>} />;
}
