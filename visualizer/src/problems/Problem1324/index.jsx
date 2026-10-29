import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import IndexedSequence from "../../components/shared/IndexedSequence";
import { code, python, pythonLineMap, parseInput, buildTrace } from "./algorithm";

const definition = {
  phases: [
    { id: "split", label: "Split", description: "Split the sentence into words." },
    { id: "measure", label: "Measure", description: "Find the longest word, which sets the number of rows." },
    { id: "row", label: "Build row", description: "Read one character from each word for this row." },
    { id: "trim", label: "Trim", description: "Remove trailing spaces and add the row to the answer." },
    { id: "done", label: "Result", description: "Return the rows." },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  pythonLineMap,
  inputLabel: 'Sentence s (e.g. {"s":"HOW ARE YOU"})',
  url: "https://leetcode.com/problems/print-words-vertically/",
  complexity: "O(n) time and O(n) space for the 200-character limit, where n is the length of s.",
  examples: [
    { label: "HOW ARE YOU", input: JSON.stringify({ s: "HOW ARE YOU" }) },
    { label: "TO BE OR NOT TO BE", input: JSON.stringify({ s: "TO BE OR NOT TO BE" }) },
  ],
};

export default function PrintWordsVerticallyWorkspace() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ step }) => <>
        <IndexedSequence label={step.row === undefined ? "Words" : `Characters for row ${step.row}`}
          length={step.words.length}
          valueAt={index => step.words[index]}
          roleAt={index => (step.chars ? `'${step.chars[index]}'` : "")} />
        <ol aria-label="Rows built so far">{step.result.map((row, index) => <li key={index}><code>{row}</code></li>)}</ol>
      </>}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  );
}
