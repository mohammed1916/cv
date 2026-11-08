import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import MinCostStringView from "./MinCostStringView";
import { code, python, parseInput, buildTrace } from "./algorithm.js";

const definition = {
  number: "3253",
  phases: [
    { id: "start", label: "Start", description: "The empty prefix is free; every other prefix is unknown." },
    { id: "position", label: "Position", description: "Scan from a reachable prefix length." },
    { id: "skip", label: "Skip", description: "This prefix length is unreachable, so nothing starts here." },
    { id: "check", label: "Word", description: "Test one word against the target at the cursor." },
    { id: "update", label: "Improve", description: "A cheaper way to reach a longer prefix was found." },
    { id: "done", label: "Answer", description: "Report the full target's cost or -1." },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Object with target, words and costs (e.g. {"target":"aaaa","words":["a","aa"],"costs":[4,3]})',
  url: "https://leetcode.com/problems/construct-string-with-minimum-cost-easy/",
  complexity: "O(m * w * L) time for target length m, w words and longest word length L, using O(m) extra space for the prefix costs. The visualization accepts a target of up to 30 letters and up to 8 words.",
  examples: [
    { label: "Two routes", input: '{"target":"abcdab","words":["ab","abc","cd","d"],"costs":[2,5,3,1]}' },
    { label: "Repeated letters", input: '{"target":"aaaa","words":["a","aa"],"costs":[4,3]}' },
    { label: "Unreachable", input: '{"target":"xyz","words":["ab"],"costs":[1]}' },
    { label: 'Single letter, zero cost', input: '{"target":"a","words":["a"],"costs":[0]}' },
    { label: 'Equal cost routes', input: '{"target":"ab","words":["a","b","ab"],"costs":[3,3,6]}' },
    { label: 'Longest target, largest cost', input: '{"target":"abcabcabcabcabcabcabcabcabcabc","words":["abc","ab","c"],"costs":[1000,1,1000]}' },
    { label: 'Long run: 30-letter target, eight words', input: '{"target":"cdabcdabcdabcdabcdabcdabcdabcd","words":["ab","b","cd","bcd","cd","d","cdab","bcd"],"costs":[573,412,129,886,565,498,79,424]}' },
  ],
};

export default function ConstructStringWithMinimumCost() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <MinCostStringView run={run} step={step} />}
      renderReasoning={({ run, step }) => (
        <p>
          {step.message} {run ? `Result: ${run.result}.` : ""}
        </p>
      )}
    />
  );
}
