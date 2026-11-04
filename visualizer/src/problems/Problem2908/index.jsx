import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import IndexedSequence from "../../components/shared/IndexedSequence";
import { code, python, parseInput, buildTrace } from "./algorithm";

const definition = {
  number: "2908",
  phases: [
    { id: "setup", label: "Setup", description: "Start with no mountain found." },
    { id: "peak", label: "Peak", description: "Choose the middle index j." },
    { id: "left", label: "Left", description: "Find the cheapest left partner." },
    { id: "right", label: "Right", description: "Find the cheapest right partner." },
    { id: "record", label: "Record", description: "Keep the smallest mountain sum." },
    { id: "done", label: "Result", description: "Report the best sum or -1." },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'JSON {"nums":[8,6,1,5,3]}',
  url: "https://leetcode.com/problems/minimum-sum-of-mountain-triplets-i/",
  complexity: "O(n^2) time and O(1) space for this per-peak scan. The visualization caps nums at 50 values.",
  examples: [
    { label: "Example 1", input: '{"nums":[8,6,1,5,3]}' },
    { label: "Example 2", input: '{"nums":[5,4,8,7,10,2]}' },
    { label: "Example 3", input: '{"nums":[6,5,4,3,4,5]}' },
  ],
};

export default function Problem2908Visualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => {
        const peaks = run.frames.filter((f) => f.phase === "right" && f.j !== null && f.j <= (step.j ?? -1));
        return (
          <>
            <IndexedSequence
              label="nums"
              length={run.input.nums.length}
              valueAt={(index) => run.input.nums[index]}
              active={step.j ?? -1}
              roleAt={(index) => (index === step.j ? "peak" : index === step.leftAt ? "left" : index === step.rightAt ? "right" : "")}
            />
            <table aria-label="Cheapest partners for each peak" style={{ borderCollapse: "collapse", color: "var(--text)" }}>
              <thead><tr>{["peak j", "value", "cheapest left", "cheapest right", "sum"].map((h) => <th key={h} scope="col" style={{ padding: "4px 8px", textAlign: "left", borderBottom: "2px solid var(--border, currentColor)" }}>{h}</th>)}</tr></thead>
              <tbody>{peaks.map((f) => (
                <tr key={f.j} data-current={f.j === step.j} style={{ background: f.j === step.j ? "var(--surface2)" : "transparent" }}>
                  <td style={{ padding: "4px 8px" }}>{f.j}</td>
                  <td style={{ padding: "4px 8px" }}>{run.input.nums[f.j]}</td>
                  <td style={{ padding: "4px 8px" }}>{f.leftMin ?? "none"}</td>
                  <td style={{ padding: "4px 8px" }}>{f.rightMin ?? "none"}</td>
                  <td style={{ padding: "4px 8px" }}>{f.leftMin !== null && f.rightMin !== null ? f.leftMin + run.input.nums[f.j] + f.rightMin : "-"}</td>
                </tr>
              ))}</tbody>
            </table>
            <output aria-label="Mountain state" style={{ color: "var(--text)" }}>
              {`peak j = ${step.j ?? "-"}, left min ${step.leftMin ?? "-"}, right min ${step.rightMin ?? "-"}, best ${step.best}`}
            </output>
          </>
        );
      }}
      renderReasoning={({ step }) => <p>{step.explanation}</p>}
    />
  );
}
