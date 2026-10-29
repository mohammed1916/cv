import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import IndexedSequence from "../../components/shared/IndexedSequence";
import { code, python, pythonLineMap, parseInput, buildTrace } from "./algorithm";

const definition = {
  number: "2451",
  phases: [
    { id: "setup", label: "Setup", description: "Start with no groups." },
    { id: "scan", label: "Scan", description: "Visit each word in order." },
    { id: "diff", label: "Differences", description: "Compute the adjacent letter differences." },
    { id: "group", label: "Group", description: "File the word's index under its difference array." },
    { id: "search", label: "Search", description: "Look for a group with exactly one word." },
    { id: "found", label: "Result", description: "Return the word with the odd difference array." },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  pythonLineMap,
  inputLabel: 'JSON {"words": ["adc","wzy","abc"]}',
  url: "https://leetcode.com/problems/odd-string-difference/",
  complexity: "O(n * m) time and O(n * m) space for n words of length m. The visualization caps n at 50 and m at 20.",
  examples: [{ label: "Example 1", input: '{"words":["adc","wzy","abc"]}' }],
};

export default function OddStringDifferenceVisualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => (
        <>
          <IndexedSequence
            label="words"
            length={run.input.length}
            active={step.i ?? -1}
            valueAt={index => run.input[index]}
            roleAt={index => (step.result && run.input[index] === step.result ? "odd" : "")}
          />
          <ul>
            {Object.entries(step.groups).map(([key, idxs]) => (
              <li key={key}>[{key}] → indices {idxs.join(", ")}</li>
            ))}
          </ul>
        </>
      )}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  );
}
