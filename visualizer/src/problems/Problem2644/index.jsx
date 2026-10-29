import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import IndexedSequence from "../../components/shared/IndexedSequence";
import { code, python, parseInput, buildTrace } from "./algorithm";

const definition = {
  phases: [
    { id: "setup", label: "Setup", description: "Start with no best divisor yet." },
    { id: "divisor", label: "Divisor", description: "Pick the next divisor." },
    { id: "score", label: "Score", description: "Count how many numbers this divisor divides." },
    { id: "compare", label: "Compare", description: "Compare with the best score; ties favour the smaller divisor." },
    { id: "update", label: "Update", description: "Record this divisor as the new best." },
    { id: "done", label: "Result", description: "Return the divisor with the maximum score." },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'JSON object (e.g. {"nums": [4,7,9,3,9], "divisors": [5,2,3]})',
  url: "https://leetcode.com/problems/find-the-maximum-divisibility-score/",
  complexity: "O(|nums| * |divisors|) time and O(|divisors|) space for the score list shown. Both arrays are at most 1000 elements.",
  examples: [
    { label: "Example 1", input: '{"nums": [2,9,15,50], "divisors": [5,3,7,2]}' },
    { label: "Example 2", input: '{"nums": [4,7,9,3,9], "divisors": [5,2,3]}' },
    { label: "Example 3", input: '{"nums": [20,14,21,10], "divisors": [10,16,20]}' },
  ],
};

export default function FindTheMaximumDivisibilityScore() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => (
        <>
          <IndexedSequence
            label="Divisor scores (null = not yet scored)"
            length={run.input.divisors.length}
            valueAt={index => (step.scores[index] === null ? "?" : step.scores[index])}
            active={step.index ?? -1}
            roleAt={index => (step.bestDiv !== null && run.input.divisors[index] === step.bestDiv ? "best" : "")}
          />
          <p>Best so far: divisor {step.bestDiv ?? "none"} with score {step.bestScore}</p>
        </>
      )}
      renderReasoning={({ step }) => <p>{step.explanation}</p>}
    />
  );
}
