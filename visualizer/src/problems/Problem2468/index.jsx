import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import IndexedSequence from "../../components/shared/IndexedSequence";
import { code, python, parseInput, buildTrace } from "./algorithm";

const definition = {
  number: "2468",
  phases: [
    { id: "setup", label: "Setup", description: "Count the message characters." },
    { id: "try", label: "Try k", description: "Try splitting into k parts." },
    { id: "digits", label: "Digits", description: "Count the digits in k and in the digit total." },
    { id: "room", label: "Room", description: "Work out how many message characters each part can hold." },
    { id: "skip", label: "Skip", description: "This number of parts has no room for message text." },
    { id: "capacity", label: "Capacity", description: "Compare the capacity with the message length." },
    { id: "reject", label: "Reject", description: "This number of parts cannot hold the message." },
    { id: "accept", label: "Accept", description: "This number of parts works. Build them." },
    { id: "part", label: "Build", description: "Fill one part and add its suffix." },
    { id: "done", label: "Result", description: "Return the parts, or an empty list." },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'JSON {"message": "short message", "limit": 15}',
  url: "https://leetcode.com/problems/split-message-based-on-limit/",
  complexity: "O(n) time and O(n) space for message length n, using the closed-form capacity check for each part count. The visualization caps the message at 50 characters and the limit at 50.",
  examples: [{ label: "Example 1", input: '{"message":"short message","limit":15}' }],
};

export default function SplitMessageVisualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => (
        <>
          <IndexedSequence
            label="message"
            length={run.input.message.length}
            active={step.pos ?? -1}
            valueAt={index => (run.input.message[index] === " " ? "_" : run.input.message[index])}
            roleAt={index => (index < (step.pos ?? 0) ? "counted" : "")}
          />
          <p>Parts built so far: {step.parts.join(" | ") || "none"}</p>
        </>
      )}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  );
}
