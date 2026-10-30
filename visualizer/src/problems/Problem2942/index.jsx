import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import IndexedSequence from "../../components/shared/IndexedSequence";
import { code, python, parseInput, buildTrace } from "./algorithm";

const definition = {
  phases: [
    { id: "setup", label: "Setup", description: "Start with an empty answer list." },
    { id: "loop", label: "Scan", description: "Visit each word in order." },
    { id: "check", label: "Check", description: "Test whether x appears in the word." },
    { id: "record", label: "Record", description: "Store the index of a matching word." },
    { id: "done", label: "Result", description: "Return the collected indices." },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'JSON object: {"words": ["leet", "code"], "x": "e"}',
  url: "https://leetcode.com/problems/find-words-containing-character/",
  complexity: "O(total length of words) time and O(n) space for n words. The visualization caps input at 50 words of up to 50 letters.",
  examples: [
    { label: "Example 1", input: '{"words": ["leet", "code"], "x": "e"}' },
    { label: "Illustrative example (not from the statement)", input: '{"words": ["abc", "bcd", "aaaa", "cbc"], "x": "a"}' },
  ],
};

export default function FindWordsContainingVisualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => (
        <>
          <IndexedSequence
            label="words"
            length={run.input.words.length}
            valueAt={(i) => run.input.words[i]}
            active={step.index}
            roleAt={(i) => (step.result.includes(i) ? "match" : "")}
          />
          <p>Character x = "{run.input.x}" · answer so far: [{step.result.join(", ")}]</p>
        </>
      )}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  );
}
