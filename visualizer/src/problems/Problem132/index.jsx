import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import { getExamples } from "../../config/examplesRegistry";
import MinCutStory from "./MinCutStory";
import { code, python, parseInput, buildTrace, pythonLineMap } from "./algorithm";
import "./PalindromePartitioningIIVisualizer.css";

const definition = {
  phases: [
    { id: "init", label: "Setup", description: "Prepare the palindrome table and the cut counts." },
    { id: "loop", label: "Scan", description: "Visit each centre of a possible palindrome." },
    { id: "check", label: "Check", description: "Expand around the centre while characters match." },
    { id: "dp", label: "Update", description: "Lower the cut count at this end position." },
    { id: "split", label: "Split", description: "Reuse the cut count of a shorter prefix." },
    { id: "palindromes", label: "Palindrome", description: "Check whether the prefix is a palindrome." },
    { id: "whole", label: "Whole", description: "The prefix itself is a palindrome, so no cut is needed." },
    { id: "done", label: "Result", description: "Report the minimum number of cuts." },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  pythonLineMap,
  inputLabel: "String (JSON object, e.g. {\"s\": \"aab\"})",
  url: "https://leetcode.com/problems/palindrome-partitioning-ii/",
  complexity: "O(n^2) time and space for n characters. The visualization caps the string at 40 characters.",
  examples: getExamples("palindrome-partitioning-ii").map(({ label, s }) => ({ label, input: JSON.stringify({ s }) })),
};

export default function PalindromePartitioningIIVisualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => (
        <MinCutStory story={run} step={step} />
      )}
      renderReasoning={({ step }) => <p>{step.explanation ?? step.message}</p>}
    />
  );
}
