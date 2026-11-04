import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import IndexedSequence from "../../components/shared/IndexedSequence";
import { code, python, parseInput, buildTrace } from "./algorithm";

const definition = {
  number: "2808",
  phases: [
    { id: "setup", label: "Setup", description: "Read the array and its length." },
    { id: "group", label: "Group", description: "Collect the positions of each value." },
    { id: "gap", label: "Gaps", description: "Measure the cyclic gap between consecutive copies." },
    { id: "answer", label: "Best", description: "Keep the best value to spread." },
    { id: "result", label: "Result", description: "Report the minimum seconds." },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: "nums (e.g. {\"nums\": [1,2,1,2]})",
  url: "https://leetcode.com/problems/minimum-seconds-to-equalize-a-circular-array/",
  complexity: "O(n) time and O(n) space. The visualization caps the array at 50 items.",
  examples: [
    { label: "Example 1", input: "{\"nums\": [1, 2, 1, 2]}" },
    { label: "Example 2", input: "{\"nums\": [2, 1, 3, 3, 2]}" },
    { label: "Example 3", input: "{\"nums\": [5, 5, 5, 5]}" },
  ],
};

// Each distinct value with the indices holding it, in the order the algorithm visits them.
function PositionsTable({ values, focus }) {
  const groups = new Map()
  values.forEach((v, i) => { if (!groups.has(v)) groups.set(v, []); groups.get(v).push(i) })
  const cell = { padding: "4px 8px", borderBottom: "1px solid var(--surface2)", color: "var(--text)" }
  return <table aria-label="Positions of each value" style={{ borderCollapse: "collapse", width: "100%" }}>
    <thead><tr>{["value", "indices (circular)", "gaps between copies"].map(h => <th key={h} scope="col" style={{ ...cell, textAlign: "left", borderBottom: "2px solid var(--border, currentColor)" }}>{h}</th>)}</tr></thead>
    <tbody>{[...groups].map(([v, idx]) => {
      const n = values.length
      const gaps = idx.map((start, k) => (idx[(k + 1) % idx.length] - start + n) % n || n)
      return <tr key={v} data-focus={v === focus} style={{ background: v === focus ? "var(--primary)" : "transparent", color: v === focus ? "#fff" : "var(--text)" }}>
        <td style={cell}>{v}</td><td style={cell}>{idx.join(", ")}</td><td style={cell}>{gaps.join(", ")}</td>
      </tr>
    })}</tbody>
  </table>
}

export default function Problem2808Visualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ step }) => <>
        <IndexedSequence
          label="nums"
          length={step.values.length}
          valueAt={i => String(step.values[i])}
          active={step.active ?? -1}
          roleAt={i => step.roles?.[i] ?? ""}
        />
        <PositionsTable values={step.values} focus={step.focus} />
      </>}
      renderReasoning={({ step }) => <p>{step.detail}</p>}
    />
  );
}
