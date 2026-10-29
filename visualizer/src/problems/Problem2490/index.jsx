import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import IndexedSequence from "../../components/shared/IndexedSequence";
import { code, python, parseInput, buildTrace } from "./algorithm";

const definition = {
  number: "2490",
  phases: [
    { id: "setup", label: "Setup", description: "Split the sentence into words." },
    { id: "scan", label: "Scan", description: "Visit each word in order." },
    { id: "last", label: "Last", description: "Read the word's last character." },
    { id: "first", label: "Next first", description: "Read the next word's first character." },
    { id: "compare", label: "Compare", description: "Compare the two characters at the boundary." },
    { id: "done", label: "Result", description: "Return whether the sentence is circular." },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'JSON {"sentence": "leetcode exercises sound delightful"}',
  url: "https://leetcode.com/problems/circular-sentence/",
  complexity: "O(n) time and O(n) space for a sentence of n characters. The visualization caps the sentence at 20 words.",
  examples: [
    { label: "Example 1", input: '{"sentence":"leetcode exercises sound delightful"}' },
    { label: "Example 2", input: '{"sentence":"Leetcode is cool"}' },
  ],
};

export default function CircularSentenceVisualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => (
        <IndexedSequence
          label="words"
          length={run.input.sentence.split(" ").length}
          active={step.i ?? -1}
          valueAt={index => run.input.sentence.split(" ")[index]}
          roleAt={index => (index < (step.i ?? 0) ? "counted" : "")}
        />
      )}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  );
}
