import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import ChainTableView from "./ChainTableView";
import { code, python, parseInput, buildTrace } from "./algorithm.js";

const definition = {
  number: "3299",
  phases: [
    { id: "start", label: "Start", description: "No chains have been recorded yet." },
    { id: "extend", label: "Extend", description: "Look up chains one step below (rising) and above (falling)." },
    { id: "store", label: "Store", description: "Record the chains that end at this value and add their sums." },
    { id: "done", label: "Result", description: "Report the total modulo 1000000007." },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: "JSON array of integers (e.g. [4,5,3,4])",
  url: "https://leetcode.com/problems/sum-of-consecutive-subsequences/",
  complexity: "O(n) expected time and O(n) space with hash maps keyed by value. The visualization accepts up to 12 values from -20 to 20 so the sums stay exact.",
  examples: [
    { label: "Rising then falling", input: "[1,2,3,2]" },
    { label: "Mixed steps", input: "[4,5,3,4]" },
    { label: "Descending run", input: "[3,2,1]" },
    { label: 'Single value', input: '[0]' },
    { label: 'Equal values', input: '[4,4,4,4]' },
    { label: 'Extreme steps', input: '[-20,20,-20,20,-20,20]' },
    { label: 'Long run: twelve generated values', input: '[-7,-11,-8,-11,15,-17,5,-11,-19,7,19,-9]' },
  ],
};

export default function SumOfConsecutiveSubsequences() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <ChainTableView run={run} step={step} />}
      renderReasoning={({ run, step }) => (
        <p>
          {step.message} {run ? `Result: ${run.result}.` : ""}
        </p>
      )}
    />
  );
}
