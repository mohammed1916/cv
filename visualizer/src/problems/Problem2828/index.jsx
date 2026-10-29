import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import IndexedSequence from "../../components/shared/IndexedSequence";
import { code, python, parseInput, buildTrace } from "./algorithm";

const definition = {
  number: "2828",
  phases: [
    { id: "length", label: "Length", description: "Compare the word count with the length of s." },
    { id: "scan", label: "Scan", description: "Visit each word in order." },
    { id: "compare", label: "Compare", description: "Compare the first letter with s." },
    { id: "result", label: "Result", description: "Report the answer." },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: "words and s (e.g. {\"words\": [\"alice\",\"bob\",\"charlie\"], \"s\": \"abc\"})",
  url: "https://leetcode.com/problems/check-if-a-string-is-an-acronym-of-words/",
  complexity: "O(n) time and O(1) extra space, where n is the number of words.",
  examples: [
    { label: "Example 1", input: "{\"words\": [\"alice\", \"bob\", \"charlie\"], \"s\": \"abc\"}" },
    { label: "Example 2", input: "{\"words\": [\"an\", \"apple\"], \"s\": \"a\"}" },
    { label: "Example 3", input: "{\"words\": [\"never\", \"gonna\", \"give\", \"up\", \"on\", \"you\"], \"s\": \"ngguoy\"}" },
  ],
};

export default function Problem2828Visualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ step }) => (
        <IndexedSequence
          label="words"
          length={step.values.length}
          valueAt={i => String(step.values[i])}
          active={step.active ?? -1}
          roleAt={i => step.roles?.[i] ?? ""}
        />
      )}
      renderReasoning={({ step }) => <p>{step.detail}</p>}
    />
  );
}
