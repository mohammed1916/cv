import AlgorithmStoryWorkspace from "../../components/shared/AlgorithmStoryWorkspace";
import CycleStory from "./CycleStory";
import { CODE, buildCycleStory } from "./algorithm";
import "./LinkedListCycleVisualizer.css";

const EXAMPLES = [
  {
    label: "Cycle pos 1 ([3,2,0,-4])",
    input: "[3, 2, 0, -4] | pos = 1",
  },
  {
    label: "Cycle pos 0 ([1,2])",
    input: "[1, 2] | pos = 0",
  },
  {
    label: "Single node ([1], pos -1)",
    input: "[1] | pos = -1",
  },
  {
    label: "Self loop ([1], pos 0)",
    input: "[1] | pos = 0",
  },
  {
    label: "Linear list ([1,2,3,4,5])",
    input: "[1, 2, 3, 4, 5] | pos = -1",
  },
  {
    label: "Long loop ([10..60], pos 2)",
    input: "[10, 20, 30, 40, 50, 60] | pos = 2",
  },
  {
    label: "Full cycle ([5,10,15,20], pos 0)",
    input: "[5, 10, 15, 20] | pos = 0",
  },
  {
    label: "Duplicates ([2,2,2,2], pos 1)",
    input: "[2, 2, 2, 2] | pos = 1",
  },
  {
    label: "Negative values ([0,-4,-8,12])",
    input: "[0, -4, -8, 12] | pos = 2",
  },
  {
    label: "Empty list ([] | pos -1)",
    input: "[] | pos = -1",
  },
];

const definition = {
  title: "Linked List Cycle",
  inputLabel: "List values & cycle pos (e.g. [3,2,0,-4] | pos=1)",
  inputType: "string",
  initialInput: "[3, 2, 0, -4] | pos = 1",
  examples: EXAMPLES,
  code: CODE.map((text, i) => ({ line: i + 1, text })),
  linePatterns: {
    2: "init",
    3: "check",
    4: "move_slow",
    5: "move_fast",
    6: "compare",
    7: "done",
    8: "done",
  },
  patterns: ["init", "check", "move_slow", "move_fast", "compare", "done"],
  build: (input) => buildCycleStory(input),
  renderStory: ({ story, step }) => <CycleStory story={story} step={step} />,
};

export default function LinkedListCycleVisualizer() {
  return <AlgorithmStoryWorkspace definition={definition} />;
}
