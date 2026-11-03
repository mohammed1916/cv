import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import { code, python, parseInput, buildTrace } from "./algorithm.js";
import SpanScanView from "./SpanScanView";

const definition = {
  number: "3104",
  phases: [
    { id: "start", label: "Setup", description: "Record first and last positions." },
    { id: "start-l", label: "Start", description: "Try a start index." },
    { id: "extend", label: "Extend", description: "Stretch the piece to reach a letter." },
    { id: "record", label: "Record", description: "The piece is closed and proper." },
    { id: "stop", label: "Stop", description: "A letter appears before the start." },
    { id: "done", label: "Result", description: "Report the longest piece or -1." },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: "Lowercase string",
  url: "https://leetcode.com/problems/find-longest-self-contained-substring/",
  complexity: "O(n^2) time and O(1) extra space for the alphabet, for a string of n letters. The visualization caps the string at 24 lowercase letters.",
  examples: [
    { label: "Repeated block", input: "abcabc" },
    { label: "Two sections", input: "abacaba" },
    { label: "Single letters", input: "abcd" },
  ],
};

export default function Problem3104Visualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <SpanScanView run={run} step={step} />}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  );
}
