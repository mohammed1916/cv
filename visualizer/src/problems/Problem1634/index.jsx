import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import Problem1634View from "./Problem1634View";
import { code, python, parseInput, buildTrace, phases } from "./algorithm.js";

const definition = {
  number: "1634",
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Object with poly1 and poly2, each a list of [coefficient, power] in descending power order',
  url: "https://leetcode.com/problems/add-two-polynomials-represented-as-linked-lists/",
  complexity: "O(m + n) time and O(m + n) output space for lists of length m and n. The visualization caps each polynomial at 8 terms.",
  examples: [
    { label: "Merge and cancel", input: '{"poly1":[[1,3],[2,1]],"poly2":[[4,3],[-2,0]]}' },
    { label: "One side longer", input: '{"poly1":[[5,3],[1,0]],"poly2":[[2,2]]}' },
  ],
};

export default function Problem1634() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <Problem1634View run={run} step={step} />}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  );
}
