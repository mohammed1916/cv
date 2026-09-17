import AlgorithmStoryWorkspace from "../../components/shared/AlgorithmStoryWorkspace";
import Cycle2Story from "./Cycle2Story";
import { CODE, buildCycle2Story } from "./algorithm";
import { getExamplesOr } from "../../config/examplesRegistry";
import "./LinkedListCycleIIVisualizer.css";

const DEFAULT_EXAMPLES = [
  {
    label: "Example 1: [3,2,0,-4], pos=1",
    values: { nodes: "[3, 2, 0, -4]", pos: 1 },
    input: { nodes: "[3, 2, 0, -4]", pos: 1 },
  },
  {
    label: "Example 2: [1,2], pos=0",
    values: { nodes: "[1, 2]", pos: 0 },
    input: { nodes: "[1, 2]", pos: 0 },
  },
  {
    label: "Example 3: [1], pos=-1",
    values: { nodes: "[1]", pos: -1 },
    input: { nodes: "[1]", pos: -1 },
  },
  {
    label: "Self Loop: [42], pos=0",
    values: { nodes: "[42]", pos: 0 },
    input: { nodes: "[42]", pos: 0 },
  },
  {
    label: "Tail + Loop: [1..7], pos=3",
    values: { nodes: "[1, 2, 3, 4, 5, 6, 7]", pos: 3 },
    input: { nodes: "[1, 2, 3, 4, 5, 6, 7]", pos: 3 },
  },
  {
    label: "Pure Cycle: [10,20,30], pos=0",
    values: { nodes: "[10, 20, 30]", pos: 0 },
    input: { nodes: "[10, 20, 30]", pos: 0 },
  },
];

const registryExamples = getExamplesOr("linked-list-cycle-ii", []);
const EXAMPLES =
  registryExamples.length > 0
    ? registryExamples.map((ex) => ({
        label: ex.label,
        values: {
          nodes: JSON.stringify(ex.nodes ?? ex.values ?? [3, 2, 0, -4]),
          pos: ex.pos ?? 1,
        },
        input: {
          nodes: JSON.stringify(ex.nodes ?? ex.values ?? [3, 2, 0, -4]),
          pos: ex.pos ?? 1,
        },
      }))
    : DEFAULT_EXAMPLES;

const definition = {
  title: "Linked List Cycle II",
  fields: [
    { key: "nodes", label: "nodes", type: "array" },
    { key: "pos", label: "pos", type: "number" },
  ],
  initialValues: {
    nodes: "[3, 2, 0, -4]",
    pos: 1,
  },
  examples: EXAMPLES,
  code: CODE.map((text, i) => ({ line: i + 1, text })),
  linePatterns: {
    1: "init",
    2: "init",
    3: "loop",
    4: "update",
    5: "update",
    6: "compare",
    7: "done",
    8: "loop",
    9: "done",
    10: "init",
    11: "init",
    12: "loop",
    13: "update",
    14: "update",
    15: "done",
  },
  patterns: ["init", "loop", "compare", "update", "done"],
  build: (input) => buildCycle2Story(input),
  renderStory: ({ story, step }) => <Cycle2Story story={story} step={step} />,
};

export default function LinkedListCycleIIVisualizer() {
  return <AlgorithmStoryWorkspace definition={definition} />;
}
