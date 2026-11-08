import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import IndexedSequence from "../../components/shared/IndexedSequence";
import { code, python, parseInput, buildTrace } from "./algorithm";

const definition = {
  number: "2843",
  phases: [
    { id: "setup", label: "Setup", description: "Start the count." },
    { id: "scan", label: "Scan", description: "Check each number." },
    { id: "count", label: "Count", description: "Count a symmetric number." },
    { id: "result", label: "Result", description: "Report the count." },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: "low and high (e.g. {\"low\": 1, \"high\": 100})",
  url: "https://leetcode.com/problems/count-symmetric-integers/",
  complexity: "O((high - low) * digits) time and O(1) extra space. The visualization caps the range at 120 numbers.",
  examples: [
    { label: "Example 1", input: "{\"low\": 1, \"high\": 100}" },
    { label: "Example 2", input: "{\"low\": 1200, \"high\": 1230}" },
    { label: "Single number", input: "{\"low\":1,\"high\":1}" },
    { label: "Equal bounds at the top", input: "{\"low\":10000,\"high\":10000}" },
    { label: "Full allowed span", input: "{\"low\":1,\"high\":120}" },
    { label: "Long run: 120 seeded numbers", input: "{\"low\":5699,\"high\":5818}" },
  ],
};

const cell = { padding: "4px 8px", borderBottom: "1px solid var(--surface2)", color: "var(--text)", textAlign: "left" };

// The digits of the number being checked, split into the two halves whose sums are compared.
function HalvesTable({ x }) {
  if (x === undefined) return null;
  const digits = String(x);
  if (digits.length % 2 === 1) {
    return <p style={{ color: "var(--text)" }}>{`${x} has ${digits.length} digits, an odd count, so it is never symmetric.`}</p>;
  }
  const half = digits.length / 2;
  const left = [...digits.slice(0, half)].map(Number);
  const right = [...digits.slice(half)].map(Number);
  const ls = left.reduce((a, b) => a + b, 0);
  const rs = right.reduce((a, b) => a + b, 0);
  return <table aria-label="Digit halves of the current number" style={{ borderCollapse: "collapse" }}>
    <thead><tr>{["number", "first half", "sum", "last half", "sum", "verdict"].map(h => <th key={h} scope="col" style={{ ...cell, borderBottom: "2px solid var(--border, currentColor)" }}>{h}</th>)}</tr></thead>
    <tbody><tr>
      <td style={cell}>{x}</td><td style={cell}>{left.join(" ")}</td><td style={cell}>{ls}</td>
      <td style={cell}>{right.join(" ")}</td><td style={cell}>{rs}</td><td style={cell}>{ls === rs ? "symmetric" : "not symmetric"}</td>
    </tr></tbody>
  </table>;
}

export default function Problem2843Visualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ step, run }) => (
        <>
          <IndexedSequence
            label="numbers in range"
            length={step.values.length}
            valueAt={i => String(step.values[i])}
            indexOffset={run.input.low}
            active={step.active ?? -1}
            roleAt={i => step.roles?.[i] ?? ""}
          />
          <HalvesTable x={step.active >= 0 ? step.values[step.active] : undefined} />
        </>
      )}
      renderReasoning={({ step }) => <p>{step.detail}</p>}
    />
  );
}
