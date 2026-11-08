import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import IndexedSequence from "../../components/shared/IndexedSequence";
import AnswerRangeBar from "../../components/shared/AnswerRangeBar";
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
  examples: [{ label: "Own case 1", input: '{"message":"tipsu nfttbhf","limit":16}' }, { label: 'Single letter', input: '{"message":"a","limit":1}' }, { label: 'Only spaces', input: '{"message":"   ","limit":2}' }, { label: 'Largest limit', input: '{"message":"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa","limit":50}' }, { label: 'Long run: 50 characters', input: '{"message":" lar  msd wqraayyojf zjb lfd onwjomakirrxixjqod   ","limit":12}' }],
};

// Feasible for the current part count, or not, once the trace has decided it.
function verdictOf(step) {
  if (step.phase === "accept" || step.phase === "part") return true;
  if (step.phase === "reject" || step.phase === "skip") return false;
  if (step.phase === "done") return Array.isArray(step.result) && step.result.length > 0;
  return null;
}

export default function SplitMessageVisualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => (
        <>
          <AnswerRangeBar
            title="Part counts still to try"
            min={1}
            max={Math.max(1, run.input.message.length)}
            low={Math.min(step.k || 1, run.input.message.length)}
            high={Math.max(1, run.input.message.length)}
            probe={step.k > 0 ? step.k : null}
            verdict={verdictOf(step)}
          />
          <dl className="algorithm-readout" aria-label="Capacity for this part count">
            <div><dt>Parts k</dt><dd>{step.k}</dd></div>
            <div><dt>Room per part before index digits</dt><dd>{step.base}</dd></div>
            <div><dt>Digit total of 1..k</dt><dd>{step.digitTotal ?? "-"}</dd></div>
          </dl>
          <IndexedSequence
            label="message (characters placed so far)"
            length={run.input.message.length}
            active={step.pos ?? -1}
            valueAt={index => (run.input.message[index] === " " ? "_" : run.input.message[index])}
            roleAt={index => (index < (step.pos ?? 0) ? "placed" : "")}
          />
          <ol aria-label="Parts built so far">
            {step.parts.map((part, index) => <li key={index}><code>{part}</code></li>)}
          </ol>
          <p>{step.message}</p>
        </>
      )}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  );
}
