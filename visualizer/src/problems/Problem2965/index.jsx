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
    { label: "Second example", input: '{"grid": [[1, 3], [2, 2]]}' },
    { label: "Second example", input: '{"grid": [[9, 1, 7], [8, 9, 2], [3, 4, 6]]}' },
    { label: 'Two by two', input: '{"grid":[[2,2],[3,4]]}' },
    { label: 'Three by three, missing 9', input: '{"grid":[[1,2,3],[4,5,6],[7,8,8]]}' },
    { label: 'Largest grid, repeat 81', input: '{"grid":[[26,37,40,58,57,8,6,42,13],[48,76,2,23,35,54,32,18,73],[36,44,61,51,49,25,66,70,34],[65,15,75,22,27,30,4,53,45],[47,11,39,52,55,69,56,77,71],[10,63,68,31,64,21,74,33,41],[28,20,59,9,81,67,38,60,81],[43,46,5,78,29,62,1,3,16],[19,12,50,24,72,7,17,14,79]]}' },
    { label: 'Long run: 8 by 8', input: '{"grid":[[31,31,20,47,29,18,37,50],[42,22,36,45,11,17,15,3],[53,14,43,7,9,1,32,44],[59,30,60,24,19,49,21,38],[12,4,33,52,46,57,34,23],[2,5,56,28,62,8,61,10],[35,58,25,13,41,48,16,39],[6,63,26,64,40,27,54,51]]}' },
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
