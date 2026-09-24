import { getExamples } from "../../config/examplesRegistry";
import AlgorithmStoryWorkspace from "../../components/shared/AlgorithmStoryWorkspace";
import CycleStory from "./CycleStory";
import { CODE, buildCycleStory } from "./algorithm";
import "./LinkedListCycleVisualizer.css";

const EXAMPLES = getExamples("linked-list-cycle");

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
