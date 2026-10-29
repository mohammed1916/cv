import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import { getExamples } from "../../config/examplesRegistry";
import { PermutationScene } from "./PermutationStory";
import { code, python, pythonLineMap, parseInput, buildTrace } from "./algorithm";
import "./PermutationStory.css";

const definition = {
  phases: [
    { id: "init", label: "Sort", description: "Sort the values so equal copies sit next to each other." },
    { id: "skip", label: "Skip", description: "Skip a used index or a duplicate branch." },
    { id: "add", label: "Choose", description: "Place the value from the current index on the path." },
    { id: "remove", label: "Undo", description: "Remove the last value and make its index available again." },
    { id: "result", label: "Record", description: "Record a complete permutation." },
    { id: "done", label: "Result", description: "Return every recorded unique permutation." },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  pythonLineMap,
  inputLabel: "JSON array of 1 to 6 integers from -10 to 10 (e.g. [1,1,2])",
  url: "https://leetcode.com/problems/permutations-ii/",
  complexity: "O(n * n!) time and O(n) recursion depth for n numbers; the visualization replays at most 12,000 events and then jumps to the final result.",
  examples: getExamples("permutations-ii").map(example => ({ label: example.label, input: JSON.stringify(example.nums) })),
};

export default function PermutationStoryWorkspace() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <PermutationScene story={run} step={step} />}
      renderReasoning={({ step }) => <p>{step.explanation ?? step.message}</p>}
    />
  );
}
