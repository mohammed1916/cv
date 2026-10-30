import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import IndexedSequence from "../../components/shared/IndexedSequence";
import { code, python, parseInput, buildTrace } from "./algorithm";

const definition = {
  number: "3389",
  phases: [
    { id: "count", label: "Count", description: "Count each letter." },
    { id: "target", label: "Target", description: "Choose a final frequency to test." },
    { id: "letter", label: "Letters", description: "Carry moved characters from letter to letter." },
    { id: "move", label: "Move", description: "Pay for characters moved forward." },
    { id: "result", label: "Compare", description: "Compare the cost of this target with the best so far." },
    { id: "done", label: "Result", description: "Return the cheapest total." },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'JSON object: {"word": "acab"}',
  url: "https://leetcode.com/problems/minimum-operations-to-make-character-frequencies-equal/",
  complexity: "O(n^3 * 26) time in this DP for word length n, and O(n^2) space per letter. The visualization accepts words up to 24 characters.",
  examples: [
    { label: "Sourced example: acab", input: '{"word": "acab"}' },
    { label: "Sourced example: wddw", input: '{"word": "wddw"}' },
    { label: "Sourced example: aaabc", input: '{"word": "aaabc"}' },
  ],
};

export default function Problem3389Visualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ step }) => (
        <>
          <IndexedSequence label="Original count of each letter (index 0 is a)" length={26}
            valueAt={index => step.counts[index]} active={step.letter ?? -1}
            roleAt={index => (index === step.letter ? "current" : "")} />
          <p>Target frequency: {step.target ?? "none yet"} · Cost now: {step.cost ?? "-"} · Best: {step.best}</p>
        </>
      )}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  );
}
