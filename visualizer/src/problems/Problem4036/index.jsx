import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import BlockSplitView from "./BlockSplitView";
import { code, python, parseInput, buildTrace, phases } from "./algorithm.js";

const definition = {
  number: "4036",
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Object with nums (one count per query)',
  url: "https://leetcode.com/problems/lexicographically-largest-string-after-pair-transformations/",
  complexity: "O(log x) time per count and O(log x) output length, because each letter stands for a block of 2 to the k copies and the blocks are taken greedily from the largest power down. The letter z is capped at 2 to the 25.",
  examples: [
    { label: "Three counts", input: '{"nums":[3,5,6]}' },
    { label: "Single copy", input: '{"nums":[1]}' },
    { label: "Power of two", input: '{"nums":[8,7]}' },
    { label: "Single count of two", input: "{\"nums\":[2]}" },
    { label: "Equal counts", input: "{\"nums\":[4,4,4,4]}" },
    { label: "Largest count", input: "{\"nums\":[100000000,1]}" },
    { label: "Long run: six counts", input: "{\"nums\":[9072095,19096475,5911507,54311428,66921315,58791910]}" },
  ],
};

export default function Problem4036Visualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <BlockSplitView run={run} step={step} />}
      renderReasoning={({ step }) => <p>{step.message} Two equal neighbours can merge into the next letter, so a run of 2 to the k copies can become a single letter k; the largest first block gives the greatest string.</p>}
    />
  );
}
