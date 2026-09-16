import AlgorithmStoryWorkspace from "../../components/shared/AlgorithmStoryWorkspace";
import TriangleStory from "./TriangleStory";
import { TRIANGLE_CODE, buildTriangleStory } from "./algorithm";

const EXAMPLES = [
  { label: "Example 1", input: "[[2], [3, 4], [6, 5, 7], [4, 1, 8, 3]]" },
  { label: "Example 2 (Single)", input: "[[-10]]" },
  { label: "Example 3 (Negative)", input: "[[-1], [2, 3], [1, -1, -3]]" },
];

const definition = {
  title: "Triangle: Minimum Path Sum",
  inputLabel: "Triangle rows (JSON array)",
  inputType: "string",
  initialInput: "[[2], [3, 4], [6, 5, 7], [4, 1, 8, 3]]",
  examples: EXAMPLES,
  code: TRIANGLE_CODE.map((text, i) => ({ line: i + 1, text })),
  linePatterns: {
    2: "init",
    3: "init",
    4: "update",
    5: "compare",
    6: "update",
    7: "done",
  },
  patterns: ["init", "compare", "update", "done"],
  build: (input) => buildTriangleStory(input),
  renderStory: ({ story, step }) => <TriangleStory story={story} step={step} />,
};

export default function TriangleVisualizer() {
  return <AlgorithmStoryWorkspace definition={definition} />;
}
