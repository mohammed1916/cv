import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import { getExamples } from "../../config/examplesRegistry";
import WordBreakStory from "./WordBreakStory";
import { code, python, pythonLineMap, parseInput, buildTrace } from "./algorithm";
import "./WordBreakVisualizer.css";

const definition = {
  phases: [
    { id: "init", label: "Setup", description: "Set up the dynamic programming table for every prefix length." },
    { id: "loop", label: "Scan", description: "Visit each end position of the string." },
    { id: "check", label: "Check", description: "Test whether a dictionary word ends at this position." },
    { id: "dp", label: "Record", description: "Record whether the prefix can be segmented." },
    { id: "done", label: "Result", description: "Report whether the whole string can be segmented." },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  pythonLineMap,
  inputLabel: 'String s | wordDict (e.g. "leetcode | leet, code")',
  url: "https://leetcode.com/problems/word-break/",
  complexity: "O(n * m) time and O(n) space for string length n and dictionary size m. The visualization caps string and dictionary size at 50.",
  question: "Decide whether a string can be split into words from a dictionary.",
  approaches: [
    { name: "Prefix dynamic programming", intuition: "A prefix is breakable if some shorter breakable prefix is followed by a dictionary word.", time: "O(n^2)", space: "O(n)" },
    { name: "Breadth-first over positions", intuition: "Explore reachable positions and jump by dictionary words.", time: "O(n^2)", space: "O(n)" },
  ],
  examples: getExamples("word-break").map(({ label, input }) => ({ label, input })),
};

export default function WordBreakVisualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => (
        <WordBreakStory story={run} step={step} stepIndex={Math.max(0, run.frames.indexOf(step))} />
      )}
      renderReasoning={({ step }) => <p>{step.explanation}</p>}
    />
  );
}
