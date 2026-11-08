import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import IndexedSequence from "../../components/shared/IndexedSequence";
import { code, python, parseInput, buildTrace } from "./algorithm";

const definition = {
  phases: [
    { id: "setup", label: "Setup", description: "Measure the array and prepare to scan for descents." },
    { id: "scan", label: "Scan", description: "Compare each neighbouring pair in order." },
    { id: "check", label: "Check", description: "Decide whether the descents can be fixed by one rotation." },
    { id: "done", label: "Result", description: "Report the number of right shifts, or -1." },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'nums (JSON object with nums, distinct integers 1 to 100)',
  url: "https://leetcode.com/problems/minimum-right-shifts-to-sort-the-array/",
  complexity: "O(n) time and O(n) space for the list of descents. The visualization caps the array at 100 elements.",
  examples: [
    { label: "Rotated", input: '{"nums":[3,4,5,1,2]}' },
    { label: "Sorted", input: '{"nums":[1,3,5]}' },
    { label: "Impossible", input: '{"nums":[2,1,4]}' },
    { label: "Single element", input: "{\"nums\":[1]}" },
    { label: "Descending pair", input: "{\"nums\":[2,1]}" },
    { label: "Largest value first", input: "{\"nums\":[100,1,2,3]}" },
    { label: "Long run: 100 seeded values", input: "{\"nums\":[13,4,52,82,8,18,92,49,67,15,89,16,38,84,66,83,6,95,71,72,30,91,77,32,75,46,69,54,44,74,31,96,40,68,88,60,14,27,48,73,76,39,36,86,22,23,26,70,12,100,20,87,42,90,56,41,34,17,99,9,58,64,7,33,28,97,94,53,47,59,50,57,61,63,19,29,79,43,85,65,3,51,24,81,2,37,45,93,10,35,78,21,25,98,11,1,80,55,62,5]}" },
  ],
};

const cell = { padding: "4px 8px", borderBottom: "1px solid var(--surface2)", color: "var(--text)", textAlign: "center" };

// The array after `shifts` right shifts: the last `shifts` values move to the front.
function RotatedRow({ nums, shifts }) {
  const n = nums.length;
  const k = ((shifts % n) + n) % n;
  const rotated = [...nums.slice(n - k), ...nums.slice(0, n - k)];
  return <table aria-label="Array after the shifts" style={{ borderCollapse: "collapse" }}>
    <thead><tr>{rotated.map((_, i) => <th key={i} scope="col" style={cell}>{i}</th>)}</tr></thead>
    <tbody><tr>{rotated.map((v, i) => <td key={i} style={{ ...cell, fontWeight: 700 }}>{v}</td>)}</tr></tbody>
  </table>;
}

export default function MinimumRightShifts() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => (
        <>
          <IndexedSequence
            label="nums"
            length={run.input.nums.length}
            valueAt={(i) => run.input.nums[i]}
            active={step.cursor}
            roleAt={(i) => (step.breaks.includes(i) ? "break" : i === step.cursor ? "pair" : "")}
          />
          <output aria-label="Descent count" style={{ color: "var(--text)" }}>{`Descents found: ${step.breaks.length}${step.breaks.length ? ` at index ${step.breaks.join(", ")}` : ""}`}</output>
          {step.result !== null && step.result >= 0 && <>
            <p style={{ color: "var(--text)", margin: 0 }}>{`After ${step.result} right shift(s) the array is sorted:`}</p>
            <RotatedRow nums={run.input.nums} shifts={step.result} />
          </>}
        </>
      )}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  );
}
