import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import IndexedSequence from "../../components/shared/IndexedSequence";
import { code, python, parseInput, buildTrace } from "./algorithm";

const definition = {
  number: "2469",
  phases: [
    { id: "setup", label: "Setup", description: "Read the Celsius temperature." },
    { id: "kelvin", label: "Kelvin", description: "Add 273.15 to get Kelvin." },
    { id: "fahrenheit", label: "Fahrenheit", description: "Multiply by 1.8 and add 32 to get Fahrenheit." },
    { id: "done", label: "Result", description: "Return the Kelvin and Fahrenheit pair." },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'JSON {"celsius": 36.50}',
  url: "https://leetcode.com/problems/convert-the-temperature/",
  complexity: "O(1) time and O(1) space. The visualization accepts Celsius values from 0 to 1000 with at most two decimals.",
  examples: [
    { label: "Example 1", input: '{"celsius":36.50}' },
    { label: "Example 2", input: '{"celsius":122.11}' },
  ],
};

export default function ConvertTemperatureVisualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ step }) => (
        <IndexedSequence
          label="result"
          length={2}
          active={-1}
          valueAt={index => `${["Kelvin", "Fahrenheit"][index]}: ${step.values[index] ?? "-"}`}
        />
      )}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  );
}
