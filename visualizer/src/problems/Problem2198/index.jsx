import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import TripletCheckView from "./TripletCheckView";
import { buildTrace, parseInput, code, python } from "./algorithm.js";

const definition = {
  phases: [
    { id: "start", label: "Start", description: "The answer begins at 0." },
    { id: "triple", label: "Triple", description: "Pick three distinct indices, i < j < k." },
    { id: "check", label: "Check", description: "Test which of the three values divide the sum." },
    { id: "count", label: "Single", description: "Exactly one divides, so the six orderings count." },
    { id: "skip", label: "Skip", description: "Zero or several divide, so the triple is not counted." },
    { id: "done", label: "Result", description: "Report the total number of ordered triples." },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Object with nums (e.g. {"nums":[2,5,7,8]})',
  url: "https://leetcode.com/problems/number-of-single-divisor-triplets/",
  complexity: "O(n^3) time and O(1) extra space for n values: every unordered index triple is checked once, and each qualifying one adds the six orderings. The visualization caps nums at 10 values from 1 to 30 so each triple can be shown.",
  examples: [
    { label: "Four values", input: '{"nums":[2,5,7,8]}' },
    { label: "Five values", input: '{"nums":[3,4,6,9,10]}' },
  ],
};

export default function NumberOfSingleDivisorTriplets() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <TripletCheckView run={run} step={step} />}
      renderReasoning={({ run, step }) => (
        <p>
          {step.message} {run && step.phase === "done" ? `Answer: ${run.result}.` : ""}
        </p>
      )}
    />
  );
}
