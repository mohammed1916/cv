import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import { getExamples } from "../../config/examplesRegistry";
import PartitionStory from "./PartitionStory";
import { code, python, parseInput, buildTrace, pythonLineMap } from "./algorithm";
import "./PalindromePartitioningVisualizer.css";

const definition = {
  phases: [
    { id: "init", label: "Setup", description: "Start with an empty partition and an empty path." },
    { id: "inspect", label: "Inspect", description: "Look at the next candidate piece." },
    { id: "validate", label: "Validate", description: "Test whether the candidate piece is a palindrome." },
    { id: "branch", label: "Branch", description: "Try the piece and recurse on the rest." },
    { id: "try", label: "Try", description: "Try a candidate piece." },
    { id: "push", label: "Push", description: "Add the piece to the path." },
    { id: "pop", label: "Pop", description: "Remove the piece to try another choice." },
    { id: "record", label: "Record", description: "Store a complete partition." },
    { id: "complete", label: "Complete", description: "The whole string has been partitioned." },
    { id: "backtrack", label: "Backtrack", description: "Return to the previous choice." },
    { id: "done", label: "Result", description: "Report every palindrome partition." },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  pythonLineMap,
  inputLabel: "String (JSON object, e.g. {\"s\": \"aab\"})",
  url: "https://leetcode.com/problems/palindrome-partitioning/",
  complexity: "Exponential in the worst case for the number of partitions. The visualization caps the string at 16 characters.",
  examples: getExamples("palindrome-partitioning").map(({ label, s }) => ({ label, input: JSON.stringify({ s }) })),
};

export default function PalindromePartitioningVisualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => (
        <PartitionStory story={run} step={step} />
      )}
      renderReasoning={({ step }) => <p>{step.explanation ?? step.message}</p>}
    />
  );
}
