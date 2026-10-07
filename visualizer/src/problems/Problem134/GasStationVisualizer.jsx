import authoredExamples0 from '../../config/examples/local--134.js';
import authoredExamples1 from '../../config/examples/gas-station.js';

import { gasStationNarrative } from './gasStationNarrative.js';
import AlgorithmStoryWorkspace from "../../components/shared/AlgorithmStoryWorkspace";
import GasStationStory from "./GasStationStory";
import { CODE, buildGasStationStory } from "./algorithm";

import "./GasStationVisualizer.css";

const DEFAULT_EXAMPLES = authoredExamples0;

const registryExamples = (authoredExamples1.length ? authoredExamples1 : []);
const EXAMPLES =
  registryExamples.length > 0
    ? registryExamples.map((ex) => ({
        label: ex.label,
        values: {
          gas: JSON.stringify(ex.gas),
          cost: JSON.stringify(ex.cost),
        },
      }))
    : DEFAULT_EXAMPLES;

// Ensure single station and other educational examples are present
if (!EXAMPLES.some((e) => e.label === "Single Station")) {
  EXAMPLES.push({
    label: "Single Station",
    values: {
      gas: "[2]",
      cost: "[2]",
    },
  });
}
if (!EXAMPLES.some((e) => e.label === "Exact Fuel (Start 0)")) {
  EXAMPLES.push({
    label: "Exact Fuel (Start 0)",
    values: {
      gas: "[3, 1, 1]",
      cost: "[1, 2, 2]",
    },
  });
}

const definition = {
  narrative: gasStationNarrative,
  title: "Gas Station: Circular Circuit",
  fields: [
    { key: "gas", label: "Gas available [gas]", type: "array" },
    { key: "cost", label: "Cost to next station [cost]", type: "array" },
  ],
  initialValues: {
    gas: "[1, 2, 3, 4, 5]",
    cost: "[3, 4, 5, 1, 2]",
  },
  examples: EXAMPLES,
  code: CODE.map((text, i) => ({ line: i + 1, text })),
  linePatterns: {
    1: "init",
    2: "check",
    3: "init",
    4: "travel",
    5: "travel",
    6: "travel",
    7: "deficit",
    8: "deficit",
    9: "deficit",
    10: "done",
  },
  patterns: ["init", "check", "travel", "deficit", "done"],
  build: (values) => {
    if (values && typeof values === "object" && "gas" in values && "cost" in values) {
      return buildGasStationStory(values.gas, values.cost);
    }
    return buildGasStationStory(values);
  },
  renderStory: ({ story, step }) => <GasStationStory story={story} step={step} />,
};

export default function GasStationVisualizer() {
  return <AlgorithmStoryWorkspace definition={definition} />;
}
