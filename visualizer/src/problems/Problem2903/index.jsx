import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import IndexedSequence from "../../components/shared/IndexedSequence";
import { code, python, parseInput, buildTrace } from "./algorithm";

const definition = {
  number: "2903",
  phases: [
    { id: "setup", label: "Setup", description: "Read the array length." },
    { id: "loop", label: "Outer", description: "Pick the first index i." },
    { id: "check", label: "Check", description: "Test a candidate pair (i, j)." },
    { id: "done", label: "Result", description: "Report the pair or [-1, -1]." },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'JSON {"nums":[...],"indexDifference":2,"valueDifference":4}',
  url: "https://leetcode.com/problems/find-indices-with-index-and-value-difference-i/",
  complexity: "O(n^2) time and O(1) space. The visualization caps nums at 100 values.",
  examples: [
    { label: "Example 1", input: '{"nums":[5,1,4,1],"indexDifference":2,"valueDifference":4}' },
    { label: "Example 2", input: '{"nums":[2,1],"indexDifference":0,"valueDifference":0}' },
    { label: "Example 3", input: '{"nums":[1,2,3],"indexDifference":2,"valueDifference":4}' },
  ],
};

// Rows are i, columns are j. A cell shows whether the pair passes both gaps; cells after the current pair are not yet checked.
function PairGrid({ run, step }) {
  const { nums, indexDifference, valueDifference } = run.input;
  const n = nums.length;
  const cell = { width: 40, height: 36, textAlign: "center", border: "1px solid var(--surface2)", color: "var(--text)" };
  return <table aria-label="Pairs checked, rows are i and columns are j" style={{ borderCollapse: "collapse" }}>
    <thead><tr><th scope="col" style={cell}>i / j</th>{nums.map((_, j) => <th key={j} scope="col" style={cell}>{j}</th>)}</tr></thead>
    <tbody>{nums.map((_, i) => <tr key={i}>
      <th scope="row" style={cell}>{i}</th>
      {nums.map((__, j) => {
        const checked = step.i !== null && step.i !== undefined && (i < step.i || (i === step.i && j <= step.j));
        const pass = Math.abs(i - j) >= indexDifference && Math.abs(nums[i] - nums[j]) >= valueDifference;
        const isCurrent = i === step.i && j === step.j;
        return <td key={j} data-pass={checked ? String(pass) : ""} style={{ ...cell, background: isCurrent ? "var(--primary)" : pass && checked ? "var(--surface2)" : "transparent", color: isCurrent ? "#fff" : "var(--text)" }}>
          {checked ? (pass ? "yes" : "no") : ""}
        </td>;
      })}
    </tr>)}</tbody>
  </table>;
}

export default function Problem2903Visualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => (
        <>
          <IndexedSequence
            label="nums"
            length={run.input.nums.length}
            valueAt={(index) => run.input.nums[index]}
            active={step.j ?? -1}
            roleAt={(index) => (index === step.i ? "i" : "")}
          />
          {run.input.nums.length <= 12 && <PairGrid run={run} step={step} />}
          <output aria-label="Pair state">
            {`i = ${step.i ?? "-"}, j = ${step.j ?? "-"}, result = ${JSON.stringify(step.result ?? run.result)}`}
          </output>
        </>
      )}
      renderReasoning={({ step }) => <p>{step.explanation}</p>}
    />
  );
}
