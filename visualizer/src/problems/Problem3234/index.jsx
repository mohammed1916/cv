import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import IndexedSequence from "../../components/shared/IndexedSequence";
import { code, python, parseInput, buildTrace } from "./algorithm";

const definition = {
  number: "3234",
  phases: [
    { id: "init", label: "Setup", description: "Start with an empty count." },
    { id: "start", label: "Start", description: "Begin a substring at a left index." },
    { id: "extend", label: "Extend", description: "Add the next character to the window." },
    { id: "check", label: "Check", description: "Compare ones with zeros squared." },
    { id: "done", label: "Result", description: "Report the count." },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Binary string s (JSON, e.g. {"s": "101101"})',
  url: "https://leetcode.com/problems/count-the-number-of-substrings-with-dominant-ones/",
  complexity: "O(n * sqrt(n)) time and O(1) extra space. The visualization accepts strings up to 60 characters.",
  examples: [
    { label: "Mixed (illustrative)", input: '{"s": "101101"}' },
    { label: "Zeros heavy (illustrative)", input: '{"s": "00011"}' },
    { label: 'One zero', input: '{"s":"0"}' },
    { label: 'One one', input: '{"s":"1"}' },
    { label: 'Alternating at maximum length', input: '{"s":"101010101010101010101010101010101010101010101010101010101010"}' },
    { label: 'Long run: 60 bits', input: '{"s":"100110010100010101010111111100010111111111111111011000100110"}' },
  ],
};

export default function CountDominantOnesVisualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => (
        <div>
          <IndexedSequence label="Binary string s" length={run.input.s.length} active={Math.max(0, step.right)}
            valueAt={index => run.input.s[index]}
            roleAt={index => (index === step.left ? "l" : index === step.right ? "r" : step.left <= index && index <= step.right ? "window" : "")} />
          <p>Zeros {step.zeros} · Ones {step.ones} · Dominant substrings {step.count}</p>
        </div>
      )}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  );
}
