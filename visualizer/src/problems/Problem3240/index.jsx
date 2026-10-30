import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import IndexedSequence from "../../components/shared/IndexedSequence";
import { code, python, parseInput, buildTrace } from "./algorithm";

const definition = {
  number: "3240",
  phases: [
    { id: "setup", label: "Setup", description: "Start the remainder table." },
    { id: "orbit", label: "Orbit", description: "Collect the mirrored cells that must match." },
    { id: "count", label: "Count", description: "Count the ones in the orbit." },
    { id: "combine", label: "Choose", description: "Try value 0 and value 1 for every remainder." },
    { id: "replace", label: "Update", description: "Keep the new remainder table." },
    { id: "done", label: "Result", description: "Report the minimum flips with total ones divisible by 4." },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Binary grid (JSON, e.g. {"grid": [[1,0,0],[0,1,0]]})',
  url: "https://leetcode.com/problems/minimum-number-of-flips-to-make-binary-grid-palindromic-ii/",
  complexity: "O(m * n) time and O(1) extra space beyond the grid, using a 4-entry remainder table. The visualization accepts grids up to 6 by 6.",
  examples: [
    { label: "2 by 3 (illustrative)", input: '{"grid": [[1,0,0],[0,1,1]]}' },
    { label: "3 by 3 (illustrative)", input: '{"grid": [[1,0,1],[0,1,0],[1,1,0]]}' },
  ],
};

export default function BinaryGridPalindromeVisualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => {
        const { grid, m, n } = run.input
        const flat = Array.from({ length: m * n }, (_, index) => index)
        const inOrbit = new Set(step.cells.map(([r, c]) => r * n + c))
        return (
          <div>
            <IndexedSequence label={`Grid cells, ${m} by ${n}, row-major`} length={flat.length}
              active={Math.max(0, step.orbitIndex)}
              valueAt={index => grid[Math.floor(index / n)][index % n]}
              roleAt={index => (inOrbit.has(index) ? "orbit" : "")} />
            <p>Remainder table dp: {step.dp.map(value => (value === Infinity ? "inf" : value)).join(" · ")}</p>
          </div>
        )
      }}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  );
}
