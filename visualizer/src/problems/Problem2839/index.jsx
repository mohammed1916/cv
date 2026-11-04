import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import IndexedSequence from "../../components/shared/IndexedSequence";
import { code, python, parseInput, buildTrace } from "./algorithm";

const definition = {
  number: "2839",
  phases: [
    { id: "even", label: "Even indices", description: "Group characters at even positions." },
    { id: "odd", label: "Odd indices", description: "Group characters at odd positions." },
    { id: "result", label: "Result", description: "Compare the groups." },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: "s1 and s2 (e.g. {\"s1\": \"abcd\", \"s2\": \"cdab\"})",
  url: "https://leetcode.com/problems/check-if-strings-can-be-made-equal-with-operations-i/",
  complexity: "O(1) time and O(1) space for length 4.",
  examples: [
    { label: "Example 1", input: "{\"s1\": \"abcd\", \"s2\": \"cdab\"}" },
    { label: "Example 2", input: "{\"s1\": \"abcd\", \"s2\": \"dacb\"}" },
  ],
};

const cell = { padding: "4px 8px", borderBottom: "1px solid var(--surface2)", color: "var(--text)", textAlign: "left" };

// A swap moves letters two apart, so each parity class stays inside its own group: compare the sorted groups.
function GroupTable({ s1, s2 }) {
  const rows = [
    { name: "even positions (0, 2)", a: [s1[0], s1[2]], b: [s2[0], s2[2]] },
    { name: "odd positions (1, 3)", a: [s1[1], s1[3]], b: [s2[1], s2[3]] },
  ];
  return <table aria-label="Letters grouped by parity" style={{ borderCollapse: "collapse", width: "100%" }}>
    <thead><tr>{["group", "s1 letters", "s2 letters", "sorted match"].map(h => <th key={h} scope="col" style={{ ...cell, borderBottom: "2px solid var(--border, currentColor)" }}>{h}</th>)}</tr></thead>
    <tbody>{rows.map(r => {
      const ok = [...r.a].sort().join() === [...r.b].sort().join();
      return <tr key={r.name}>
        <td style={cell}>{r.name}</td><td style={cell}>{r.a.join(", ")}</td><td style={cell}>{r.b.join(", ")}</td>
        <td style={cell}>{ok ? "yes" : "no"}</td>
      </tr>;
    })}</tbody>
  </table>
}

export default function Problem2839Visualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => (
        <>
          <IndexedSequence
            label="s1 then s2 (indices 0-3 are s1, 4-7 are s2)"
            length={step.values.length}
            valueAt={i => String(step.values[i])}
            active={step.active ?? -1}
            roleAt={i => step.roles?.[i] ?? ""}
          />
          <GroupTable s1={run.input.s1} s2={run.input.s2} />
        </>
      )}
      renderReasoning={({ step }) => <p>{step.detail}</p>}
    />
  );
}
