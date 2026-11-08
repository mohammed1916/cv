import { Fragment } from "react";
import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import GraphTraversalView from "../../components/shared/GraphTraversalView";
import { code, python, parseInput, buildTrace } from "./algorithm";

const definition = {
  number: "2836",
  phases: [
    { id: "setup", label: "Setup", description: "Read the input." },
    { id: "table", label: "Jump table", description: "Build the 2^j pass tables." },
    { id: "search", label: "Try each start", description: "Walk the bits of k from each start." },
    { id: "result", label: "Result", description: "Report the best total." },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: "receiver and k (e.g. {\"receiver\": [2,0,1], \"k\": 4})",
  url: "https://leetcode.com/problems/maximize-value-of-function-in-a-ball-passing-game/",
  complexity: "O(n log k) time and O(n log k) space. The visualization caps n at 24 players.",
  examples: [
    { label: "Example 1", input: "{\"receiver\": [2, 0, 1], \"k\": 4}" },
    { label: "Example 2", input: "{\"receiver\": [1, 1, 1, 2, 3], \"k\": 3}" },
    { label: "Single self loop", input: "{\"receiver\":[0],\"k\":5}" },
    { label: "Equal receivers", input: "{\"receiver\":[1,1,1,1],\"k\":1000}" },
    { label: "Very large k", input: "{\"receiver\":[1,2,0],\"k\":10000000000}" },
    { label: "Long run: 24 seeded receivers", input: "{\"receiver\":[5,18,3,8,9,6,23,20,5,2,19,8,9,6,15,4,5,2,3,0,17,6,23,12],\"k\":1000000}" },
  ],
};

const cell = { padding: "4px 8px", borderBottom: "1px solid var(--surface2)", color: "var(--text)", textAlign: "left" };

// The jump table: row = player, one column per level j holding the holder after 2^j passes and the sum of receivers met.
function JumpTable({ levels }) {
  const n = levels.nxt[0].length;
  const headers = levels.nxt.map((_, j) => `2^${j} passes`);
  return <table aria-label="Jump table by level" style={{ borderCollapse: "collapse", width: "100%" }}>
    <thead><tr>
      <th scope="col" style={{ ...cell, borderBottom: "2px solid var(--border, currentColor)" }}>player</th>
      {headers.map(h => <th key={h} scope="col" colSpan={2} style={{ ...cell, borderBottom: "2px solid var(--border, currentColor)" }}>{h}</th>)}
    </tr>
    <tr><th scope="col" style={cell}>x</th>{headers.map(h => <Fragment key={h}><th scope="col" style={cell}>holder</th><th scope="col" style={cell}>sum</th></Fragment>)}</tr></thead>
    <tbody>{Array.from({ length: n }, (_, x) => <tr key={x}>
      <td style={cell}>{x}</td>
      {levels.nxt.map((_, j) => <Fragment key={j}><td style={cell}>{levels.nxt[j][x]}</td><td style={cell}>{levels.sums[j][x]}</td></Fragment>)}
    </tr>)}</tbody>
  </table>
}

export default function Problem2836Visualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ step }) => (
        <>
          <GraphTraversalView
            title="Ball passing graph"
            n={step.n}
            edges={step.edges}
            directed={step.directed}
            current={step.current}
            visited={step.visited}
            done={step.done}
            tags={step.tags}
            notes={step.notes}
            showFrontier={false}
          />
          {step.levels.nxt.length > 0 && <JumpTable levels={step.levels} />}
        </>
      )}
      renderReasoning={({ step }) => <p>{step.detail}</p>}
    />
  );
}
