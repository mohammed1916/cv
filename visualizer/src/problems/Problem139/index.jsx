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
