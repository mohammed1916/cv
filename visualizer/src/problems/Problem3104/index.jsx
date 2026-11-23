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
  question: "Find the longest substring whose letters appear nowhere outside it.",
  approaches: [
    { name: "Check each substring with first and last positions", intuition: "For each substring, confirm that every letter inside it has all its occurrences inside the same range.", time: "O(n^2)", space: "O(1) for the alphabet" },
  ],
  examples: [
    { label: "Repeated block", input: "abcabc" },
    { label: "Two sections", input: "abacaba" },
    { label: "Single letters", input: "abcd" },
    { label: "Single letter", input: "z" },
    { label: "Two equal letters", input: "aa" },
    { label: "Longest allowed: 24 letters", input: "abcdefghijklmnopqrstuvwx" },
    { label: "Long run: 24 letters", input: "dcbadcbadcbadcbadcbadcba" },
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
