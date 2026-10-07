import authoredExamples0 from '../../config/examples/local--142.js';
import authoredExamples1 from '../../config/examples/linked-list-cycle-ii.js';

import { detectCycle2Narrative } from './detectCycle2Narrative.js';
import AlgorithmStoryWorkspace from "../../components/shared/AlgorithmStoryWorkspace";
import Cycle2Story from "./Cycle2Story";
import { CODE, buildCycle2Story } from "./algorithm";

import "./LinkedListCycleIIVisualizer.css";

const DEFAULT_EXAMPLES = authoredExamples0;

const registryExamples = (authoredExamples1.length ? authoredExamples1 : []);
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
  narrative: detectCycle2Narrative,
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
