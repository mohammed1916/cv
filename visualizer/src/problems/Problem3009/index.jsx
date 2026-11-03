import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import ChartCrossingView from "./ChartCrossingView";
import { code, python, parseInput, buildTrace } from "./algorithm.js";

const phases = [
  { id: "start", label: "Heights", description: "List the distinct heights and candidate lines." },
  { id: "candidate", label: "Line", description: "Place the horizontal line at a candidate height." },
  { id: "point", label: "Point", description: "A chart point sits exactly on the line." },
  { id: "segment", label: "Segment", description: "A segment crosses the line inside its span." },
  { id: "best", label: "Compare", description: "Keep the largest count so far." },
  { id: "done", label: "Result", description: "Report the best line." },
];

const definition = {
  number: "3009",
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: "Array y of 2 to 12 heights, adjacent values different (e.g. [2,5,1,4])",
  url: "https://leetcode.com/problems/maximum-number-of-intersections-on-the-chart/",
  complexity: "O(k * n) time for k distinct heights and n points, since each candidate line is checked against every point and segment; O(n) space. The visualization caps n at 12 points.",
  examples: [
    { label: "Zigzag", input: "[2,5,1,4,3]" },
    { label: "Two points", input: "[7,4]" },
    { label: "Tall peaks", input: "[1,6,2,6,1]" },
  ],
};

export default function Problem3009Visualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <ChartCrossingView run={run} step={step} />}
      renderReasoning={({ step }) => (
        <p>{step.message}</p>
      )}
    />
  );
}
