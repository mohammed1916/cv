import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import DigitWalkView from "./DigitWalkView";
import { code, python, parseInput, buildTrace, phases } from "./algorithm.js";

const definition = {
  number: "4060",
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Object with l and r (integers, 1 <= l <= r <= 10^12)',
  url: "https://leetcode.com/problems/count-evenly-good-integers/",
  complexity: "O(D * 10) time for D digits, to count up to one bound; the answer is the difference of two such counts. The bound 10^12 used here is a visualization choice, and the official range is not verified in this draft.",
  examples: [
    { label: "First ten", input: '{"l":1,"r":10}' },
    { label: "Three digits", input: '{"l":100,"r":250}' },
    { label: "Single number", input: '{"l":7,"r":7}' },
    { label: "Smallest range", input: "{\"l\":1,\"r\":1}" },
    { label: "Equal ends", input: "{\"l\":50,\"r\":50}" },
    { label: "Largest range end", input: "{\"l\":1,\"r\":1000000000000}" },
    { label: "Long run: twelve-digit range", input: "{\"l\":123456789,\"r\":987654321012}" },
  ],
};

export default function Problem4060Visualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <DigitWalkView run={run} step={step} />}
      renderReasoning={({ step }) => <p>{step.message} Each number is judged only by the parity of its even digits, so a table of digit-string counts by parity answers every completion at once.</p>}
    />
  );
}
