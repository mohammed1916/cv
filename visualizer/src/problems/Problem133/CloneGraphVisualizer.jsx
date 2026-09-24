import { getExamples } from "../../config/examplesRegistry";
import AlgorithmStoryWorkspace from "../../components/shared/AlgorithmStoryWorkspace";
import CloneGraphStory from "./CloneGraphStory";
import { CODE, buildCloneGraphStory } from "./algorithm";
import "./CloneGraphVisualizer.css";

const EXAMPLES = getExamples("clone-graph");

const definition = {
  title: "Clone Graph",
  inputLabel: "Adjacency List (1-indexed JSON array)",
  inputType: "string",
  initialInput: "[[2,4],[1,3],[2,4],[1,3]]",
  examples: EXAMPLES,
  code: CODE.map((text, i) => ({ line: i + 1, text })),
  linePatterns: {
    1: "init",
    2: "check",
    3: "init",
    4: "init",
    5: "clone",
    6: "loop",
    7: "dequeue",
    8: "loop",
    9: "check",
    10: "clone",
    11: "enqueue",
    12: "connect",
    13: "done",
  },
  patterns: [
    "init",
    "check",
    "clone",
    "loop",
    "dequeue",
    "enqueue",
    "connect",
    "done",
  ],
  build: (input) => buildCloneGraphStory(input),
  renderStory: ({ story, step, stepIndex }) => (
    <CloneGraphStory story={story} step={step} stepIndex={stepIndex} />
  ),
};

export default function CloneGraphVisualizer() {
  return <AlgorithmStoryWorkspace definition={definition} />;
}
