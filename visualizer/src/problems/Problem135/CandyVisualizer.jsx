import authoredExamples0 from '../../config/examples/local--135.js';
import authoredExamples1 from '../../config/examples/candy.js';

import AlgorithmStoryWorkspace from "../../components/shared/AlgorithmStoryWorkspace";
import CandyStory from "./CandyStory";
import { CODE, buildCandyStory } from "./algorithm";
import { candyNarrative } from "./candyNarrative";

import "./CandyVisualizer.css";

const DEFAULT_EXAMPLES = authoredExamples0;

const registryExamples = (authoredExamples1.length ? authoredExamples1 : []);
const EXAMPLES =
  registryExamples.length > 0
    ? registryExamples.map((ex) => ({
        label: ex.label,
        input: JSON.stringify(ex.ratings ?? ex.input ?? ex),
      }))
    : DEFAULT_EXAMPLES;

const definition = {
  narrative: candyNarrative,
  title: "Candy",
  inputLabel: "Children ratings (JSON array or comma-separated)",
  inputType: "string",
  initialInput: "[1, 0, 2]",
  examples: EXAMPLES,
  code: CODE.map((text, i) => ({ line: i + 1, text })),
  linePatterns: {
    2: "init",
    3: "init",
    4: "loop",
    5: "compare",
    6: "update",
    7: "loop",
    8: "compare",
    9: "update",
    10: "done",
  },
  patterns: ["init", "loop", "compare", "update", "done"],
  build: (input) => buildCandyStory(input),
  renderStory: ({ story, step }) => <CandyStory story={story} step={step} />,
};

export default function CandyVisualizer() {
  return <AlgorithmStoryWorkspace definition={definition} />;
}
