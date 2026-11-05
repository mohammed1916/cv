import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import RangeTallyView from "./RangeTallyView";
import { code, python, parseInput, buildTrace, phases } from "./algorithm.js";

const definition = {
  number: "4042",
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Object with nums, k, start [l, r], and q (number of queries)',
  url: "https://leetcode.com/problems/valid-k-unique-subarrays-ii/",
  complexity: "O(q * n) time for q queries over an array of n values, by recounting each range. The visualization caps n at 14 and q at 12; The query interface takes the first range l0, r0 and q queries, as in the statement.",
  examples: [
    { label: "Two pairs", input: '{"nums":[1,1,2,2],"k":2,"start":[0,3],"q":2}' },
    { label: "Odd counts", input: '{"nums":[1,2,2,3],"k":1,"start":[0,3],"q":2}' },
    { label: "Moving window", input: '{"nums":[4,4,7,7,7,7],"k":2,"start":[1,5],"q":3}' },
  ],
};

export default function Problem4042Visualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <RangeTallyView run={run} step={step} />}
      renderReasoning={({ step }) => <p>{step.message} The next range comes from the current endpoints and the g value chosen by this answer.</p>}
    />
  );
}
