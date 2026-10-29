import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import IndexedSequence from "../../components/shared/IndexedSequence";
import { buildTrace, parseInput, code, python } from "./algorithm";

const definition = {
  number: "2678",
  phases: [
    { id: "start", label: "Start", description: "Begin with a count of zero." },
    { id: "scan", label: "Scan", description: "Move to the next passenger detail." },
    { id: "age", label: "Read age", description: "Read the two age digits at positions 11 and 12." },
    { id: "check", label: "Compare", description: "Check whether the age is greater than 60." },
    { id: "add", label: "Count", description: "Add one for this senior passenger." },
    { id: "done", label: "Result", description: "Return the number of passengers older than 60." },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'JSON object with details (e.g. {"details":["7868190130M7522"]})',
  url: "https://leetcode.com/problems/number-of-senior-citizens/",
  complexity: "O(n) time and O(1) extra space for n passenger details. The visualization caps the list at 50 items.",
  examples: [
    { label: "Example 1", input: '{"details":["7868190130M7522","5303914400F9211","9273338290F4010"]}' },
    { label: "Example 2", input: '{"details":["1313579440F2036","2921522980M5644"]}' },
  ],
};

export default function NumberOfSeniorCitizens() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => (
        <IndexedSequence
          label="Passenger details"
          length={run.input.details.length}
          valueAt={(i) => run.input.details[i]}
          active={step.index}
          roleAt={(i) => (step.seniors.includes(i) ? "senior" : i < step.checked ? "checked" : "")}
        />
      )}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  );
}
