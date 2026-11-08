import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import GraphTraversalView from "../../components/shared/GraphTraversalView";

const cellStyle = { width: 30, height: 30, textAlign: "center", fontFamily: "monospace", color: "var(--text)", border: "1px solid var(--border)" };

// Each colour's bounding box is outlined; the box being scanned is outlined thick.
function BoxGrid({ grid, colors, current }) {
  const colour = current >= 0 ? colors[current] : null;
  let box = null;
  if (colour !== null) {
    grid.forEach((row, r) => row.forEach((value, c) => {
      if (value !== colour) return;
      box = box ? [Math.min(box[0], r), Math.max(box[1], r), Math.min(box[2], c), Math.max(box[3], c)] : [r, r, c, c];
    }));
  }
  return <table aria-label="Target grid" style={{ borderCollapse: "collapse", marginBottom: 8 }}><tbody>
    {grid.map((row, r) => <tr key={r}>{row.map((value, c) => {
      const inBox = box && r >= box[0] && r <= box[1] && c >= box[2] && c <= box[3];
      return <td key={c} style={{ ...cellStyle, fontWeight: value === colour ? 700 : 400,
        background: inBox ? "color-mix(in srgb, var(--primary) 18%, transparent)" : "transparent",
        outline: inBox ? "1px dashed var(--primary)" : "none" }}>{value}</td>;
    })}</tr>)}
  </tbody></table>
}

// A list of node -> prerequisites: a colour can be printed once every colour listed before it is printed.
function PrereqList({ colors, edges, done, current }) {
  return <ul aria-label="Colour prerequisites" style={{ color: "var(--text)" }}>
    {colors.map((colour, i) => {
      const prereq = edges.filter(([, b]) => b === i).map(([a]) => colors[a])
      const finished = done.includes(i);
      return <li key={colour} style={{ fontWeight: i === current ? 700 : 400 }}>
        {colour} needs {prereq.length ? prereq.join(", ") : "nothing"} first{finished ? " (printed)" : ""}
      </li>;
    })}
  </ul>
}
import { code, python, pythonLineMap, parseInput, buildTrace } from "./algorithm";

const definition = {
  number: "1591",
  phases: [
    { id: "bounds", label: "Bounds", description: "Find the bounding rectangle of every color." },
    { id: "scan", label: "Scan", description: "Scan each color's rectangle for other colors." },
    { id: "edge", label: "Edges", description: "Record a must-be-painted-before edge." },
    { id: "order", label: "Order", description: "Remove colors with no remaining prerequisite." },
    { id: "done", label: "Result", description: "Report whether every color could be ordered." },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  pythonLineMap,
  inputLabel: 'Input JSON: {"targetGrid": [[...], ...]}',
  url: "https://leetcode.com/problems/strange-printer-ii/",
  complexity: "O(C * m * n) time for C colors on an m x n grid, plus O(C^2) for the graph. The visualization caps the grid at 12 x 12 and colors at 24.",
  examples: [
    { label: "Example 1", input: JSON.stringify({ targetGrid: [[3, 3, 3], [3, 4, 3], [3, 3, 3]] }) },
    { label: "Example 2", input: JSON.stringify({ targetGrid: [[1, 2], [2, 1]] }) },
    { label: "Example 3", input: JSON.stringify({ targetGrid: [[5, 6, 5], [6, 6, 6]] }) },
    { label: "Single cell", input: "{\"targetGrid\":[[1]]}" },
    { label: "One colour fills the grid", input: "{\"targetGrid\":[[2,2],[2,2]]}" },
    { label: "Two colours in a row", input: "{\"targetGrid\":[[1,2,1]]}" },
    { label: "Twelve by twelve checkerboard", input: "{\"targetGrid\":[[2,1,2,1,2,1,2,1,2,1,2,1],[1,2,1,2,1,2,1,2,1,2,1,2],[2,1,2,1,2,1,2,1,2,1,2,1],[1,2,1,2,1,2,1,2,1,2,1,2],[2,1,2,1,2,1,2,1,2,1,2,1],[1,2,1,2,1,2,1,2,1,2,1,2],[2,1,2,1,2,1,2,1,2,1,2,1],[1,2,1,2,1,2,1,2,1,2,1,2],[2,1,2,1,2,1,2,1,2,1,2,1],[1,2,1,2,1,2,1,2,1,2,1,2],[2,1,2,1,2,1,2,1,2,1,2,1],[1,2,1,2,1,2,1,2,1,2,1,2]]}" },
    { label: "Long run: 12 by 12, four colours", input: "{\"targetGrid\":[[4,2,1,3,3,2,4,2,4,1,3,2],[4,1,2,4,2,4,3,3,4,3,4,1],[4,2,2,4,3,4,1,1,1,2,1,3],[1,4,1,4,4,2,2,2,2,4,4,2],[3,1,2,3,2,2,2,2,4,3,2,4],[1,3,2,2,1,3,4,3,3,3,2,1],[4,3,1,2,4,3,1,3,3,2,2,3],[1,1,3,4,1,3,1,3,4,2,4,4],[1,4,3,3,2,2,4,3,1,4,1,1],[3,1,3,1,3,3,1,3,3,4,4,2],[1,4,4,3,2,1,1,2,2,1,3,3],[4,1,1,1,1,1,4,1,1,4,4,3]]}" },
  ],
};

export default function StrangePrinterIIVisualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => (
        <>
        <BoxGrid grid={run.input.targetGrid} colors={run.colors} current={step.current} />
        <PrereqList colors={run.colors} edges={step.edges} done={step.done} current={step.current} />
        <GraphTraversalView
          title="Must-be-painted-before graph (colors)"
          n={run.colors.length}
          labels={run.colors.map(String)}
          edges={step.edges}
          directed
          current={step.current}
          neighbour={step.neighbour}
          frontier={step.queue}
          frontierKind="stack"
          done={step.done}
          tags={step.tags}
        />
        </>
      )}
      renderReasoning={({ run }) => <p>{`Colors: ${run.colors.join(", ")}. The grid is printable exactly when this graph has no cycle.`}</p>}
    />
  );
}
