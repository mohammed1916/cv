import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import { getExamples } from "../../config/examplesRegistry";
import PalindromeStory from "./PalindromeStory";
import { code, python, parseInput, buildTrace, pythonLineMap } from "./algorithm";
import "./ValidPalindromeVisualizer.css";

const definition = {
  phases: [
    { id: "init", label: "Setup", description: "Place a pointer at each end of the text." },
    { id: "compare", label: "Compare", description: "Compare the two outer alphanumeric characters." },
    { id: "match", label: "Match", description: "The two characters agree." },
    { id: "mismatch", label: "Mismatch", description: "The characters differ, so the text is not a palindrome." },
    { id: "skip", label: "Skip", description: "Ignore a character that is not alphanumeric." },
    { id: "update", label: "Advance", description: "Move both pointers inward." },
    { id: "done", label: "Result", description: "Report whether the cleaned text reads the same both ways." },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  pythonLineMap,
  inputLabel: "Text (JSON object, e.g. {\"s\": \"A man, a plan, a canal: Panama\"})",
  url: "https://leetcode.com/problems/valid-palindrome/",
  complexity: "O(n) time and O(1) extra space for n characters. The visualization caps the text at 60 characters.",
  examples: getExamples("valid-palindrome").map(({ label, s }) => ({ label, input: JSON.stringify({ s }) })),
};

export default function ValidPalindromeVisualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => (
        <PalindromeStory story={run} step={step} />
      )}
      renderReasoning={({ step }) => <p>{step.explanation ?? step.message}</p>}
    />
  );
}
