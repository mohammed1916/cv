import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import { code, python, parseInput, buildTrace } from "./algorithm.js";
import LinkedListGameView from "./LinkedListGameView";

const definition = {
  number: "3062",
  phases: [
    { id: "start", label: "Scores", description: "Both teams start at zero." },
    { id: "pair", label: "Pair", description: "Compare one pair of nodes." },
    { id: "done", label: "Result", description: "Report the winning team or a tie." },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: "JSON array of an even number of integers",
  url: "https://leetcode.com/problems/winner-of-the-linked-list-game/",
  complexity: "O(n) time and O(1) extra space for n nodes. The result is returned as Even, Odd or Tie. The visualization caps the list at 12 nodes with values from 1 to 100; the algorithm itself is a single pass over the pairs.",
  examples: [
    { label: "Odd team wins", input: "[4, 9, 2, 7, 6, 5]" },
    { label: "Even team wins", input: "[8, 1, 4, 3, 6, 5, 2, 7]" },
    { label: "Tie", input: "[2, 5, 4, 3]" },
    { label: 'Equal values', input: '[9,9,9,9]' },
    { label: 'Extreme values', input: '[100,1,100,1,100,1]' },
    { label: 'Smallest pair', input: '[7,7]' },
    { label: 'Long run: 12 values', input: '[32,49,58,99,84,69,78,7,24,97,82,99]' },
  ],
};

export default function Problem3062Visualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <LinkedListGameView run={run} step={step} />}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  );
}
