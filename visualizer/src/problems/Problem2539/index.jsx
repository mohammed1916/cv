import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import LetterLevelsView from "./LetterLevelsView";
import { buildTrace, code, parseInput, phases, python } from "./algorithm.js";

const definition = {
  number: "2539",
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: "Lowercase string (e.g. aabb)",
  url: "https://leetcode.com/problems/count-the-number-of-good-subsequences/description/",
  complexity: "O(26 * L) time for L letters after counting, O(1) extra space with a small binomial table. The visualization caps the string at 20 lowercase letters; the official bounds are not verified in this draft.",
  examples: [
    { label: "Example", input: '"aabb"' },
    { label: "Single letter", input: '"aaa"' },
    { label: "Mixed", input: '"abcabc"' },
  ],
};

export default function CountGoodSubsequences() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <LetterLevelsView run={run} step={step} />}
      renderReasoning={({ run, step }) => (
        <p>
          In a good subsequence every letter used appears the same number of times, say k. For each k, each letter either is left out or contributes exactly k of its positions, which is C(count, k) choices. Multiplying over letters counts every combination at that level, and subtracting the empty choice leaves the nonempty ones.
          {run ? ` Final answer: ${run.result}.` : ""} {step.message}
        </p>
      )}
    />
  );
}
