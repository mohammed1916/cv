import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import Problem1692View from "./Problem1692View";
import { code, python, parseInput, buildTrace, phases } from "./algorithm.js";

const definition = {
  number: "1692",
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Object with n (candies) and k (bags), e.g. {"n":4,"k":2}',
  url: "https://leetcode.com/problems/count-ways-to-distribute-candies/",
  complexity: "O(n * k) time and O(n * k) space with modulo 1000000007. The visualization caps n at 12.",
  examples: [
    { label: "Four candies, two bags", input: '{"n":4,"k":2}' },
    { label: "Three candies, two bags", input: '{"n":3,"k":2}' },
  { label: 'One bag', input: '{"n":1,"k":1}' },
  { label: 'Bags equal to candies', input: '{"n":3,"k":3}' },
  { label: 'Largest n', input: '{"n":12,"k":6}' },
  { label: 'Long run: 12 candies', input: '{"n":12,"k":7}' },
  ],
};

export default function Problem1692() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <Problem1692View run={run} step={step} />}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  );
}
