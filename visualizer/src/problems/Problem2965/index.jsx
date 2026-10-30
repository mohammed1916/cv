import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import IndexedSequence from "../../components/shared/IndexedSequence";
import { code, python, parseInput, buildTrace } from "./algorithm";

const definition = {
  phases: [
    { id: "setup", label: "Setup", description: "Make a count table for values 1 to n squared." },
    { id: "count", label: "Count", description: "Count each grid value." },
    { id: "scan", label: "Scan", description: "Check each value from 1 to n squared." },
    { id: "repeat", label: "Repeated", description: "Find the value counted twice." },
    { id: "missing", label: "Missing", description: "Find the value counted zero times." },
    { id: "done", label: "Result", description: "Return [repeated, missing]." },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'JSON object: {"grid": [[1, 3], [2, 2]]}',
  url: "https://leetcode.com/problems/find-missing-and-repeated-values/",
  complexity: "O(n^2) time and O(n^2) space for an n x n grid. The visualization caps n at 9.",
  examples: [
    { label: "Illustrative example (not from the statement)", input: '{"grid": [[1, 3], [2, 2]]}' },
    { label: "Illustrative example (not from the statement)", input: '{"grid": [[9, 1, 7], [8, 9, 2], [3, 4, 6]]}' },
  ],
};

export default function FindMissingAndRepeatedVisualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => (
        <>
          <IndexedSequence
            label="occurrence counts for values 1 to n squared (index = value)"
            length={step.counts.length - 1}
            valueAt={(i) => step.counts[i + 1]}
            active={step.index - 1}
            indexOffset={1}
            roleAt={(i) => (i + 1 === step.repeated ? "repeated" : i + 1 === step.missing ? "missing" : "")}
          />
          <p>
            Grid cells: [{run.input.grid.flat().join(", ")}] · repeated: {step.repeated} · missing: {step.missing}
          </p>
        </>
      )}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  );
}
