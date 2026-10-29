import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import { getExamples } from "../../config/examplesRegistry";
import GasStationStory from "./GasStationStory";
import { code, python, parseInput, buildTrace, pythonLineMap } from "./algorithm";
import "./GasStationVisualizer.css";

const definition = {
  phases: [
    { id: "init", label: "Setup", description: "Start at station 0 with an empty tank." },
    { id: "check", label: "Check", description: "Compare the total gas with the total cost." },
    { id: "travel", label: "Travel", description: "Drive from one station to the next." },
    { id: "drive", label: "Drive", description: "Fuel up and drive on." },
    { id: "deficit", label: "Deficit", description: "The tank ran dry, so the start moves past this station." },
    { id: "restart", label: "Restart", description: "Try a new candidate starting station." },
    { id: "done", label: "Result", description: "Report the starting station or -1." },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  pythonLineMap,
  inputLabel: "Gas and cost (JSON object, e.g. {\"gas\": [1,2,3,4,5], \"cost\": [3,4,5,1,2]})",
  url: "https://leetcode.com/problems/gas-station/",
  complexity: "O(n) time and O(1) space for n stations. The visualization caps the trip at 40 stations.",
  examples: getExamples("gas-station").map(({ label, gas, cost }) => ({ label, input: JSON.stringify({ gas, cost }) })),
};

export default function GasStationVisualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => (
        <GasStationStory story={run} step={step} />
      )}
      renderReasoning={({ step }) => <p>{step.explanation ?? step.message}</p>}
    />
  );
}
