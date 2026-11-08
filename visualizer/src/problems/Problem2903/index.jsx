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
    { label: 'Five values, index gap two', input: '{"nums":[9,2,4,11,7],"indexDifference":2,"valueDifference":3}' },
    { label: 'Equal values, zero value gap', input: '{"nums":[7,7,7],"indexDifference":2,"valueDifference":0}' },
    { label: 'Large jumps, index gap one', input: '{"nums":[10,30,20,40],"indexDifference":1,"valueDifference":15}' },
    { label: "Single value", input: "{\"nums\":[3],\"indexDifference\":0,\"valueDifference\":0}" },
    { label: "Equal values with zero difference", input: "{\"nums\":[4,4,4],\"indexDifference\":1,\"valueDifference\":0}" },
    { label: "Longest input, largest limits", input: "{\"nums\":[50,0,50,0,50,0,50,0,50,0,50,0,50,0,50,0,50,0,50,0,50,0,50,0,50,0,50,0,50,0,50,0,50,0,50,0,50,0,50,0,50,0,50,0,50,0,50,0,50,0,50,0,50,0,50,0,50,0,50,0,50,0,50,0,50,0,50,0,50,0,50,0,50,0,50,0,50,0,50,0,50,0,50,0,50,0,50,0,50,0,50,0,50,0,50,0,50,0,50,0],\"indexDifference\":100,\"valueDifference\":50}" },
    { label: "Long run: 100 values", input: "{\"nums\":[18,30,26,6,6,11,32,11,15,18,49,38,22,0,42,30,16,22,8,49,38,22,4,21,41,42,42,22,23,9,7,17,44,37,28,18,12,22,8,46,34,34,3,27,15,29,28,15,0,22,22,11,16,27,18,8,15,16,47,18,20,37,44,20,40,8,45,26,32,23,24,6,7,37,7,13,28,49,46,28,10,41,32,14,25,49,44,7,20,43,15,38,32,43,38,32,48,3,21,36],\"indexDifference\":37,\"valueDifference\":12}" },
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
