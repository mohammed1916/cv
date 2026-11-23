import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import authoredExamples0 from "../../config/examples/local--417.js";
import ParticleFlowView from "./ParticleFlowView";
import { code, python, parseInput, buildTrace, pythonLineMap, phases } from "./algorithm.js";

const definition = {
  number: "417",
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  pythonLineMap,
  inputLabel: "Heights matrix (e.g. [[1,2],[4,3]])",
  url: "https://leetcode.com/problems/pacific-atlantic-water-flow/",
  complexity: "O(m * n) time and space for an m x n grid. The visualization caps the grid at 20 x 20; the official limit is 200 x 200 with heights from 0 to 10^5.",
  question: "Find the cells of a grid from which water can flow to both the Pacific and Atlantic oceans.",
  approaches: [
    { name: "Reverse flood from each ocean", intuition: "Flood inland from each ocean's border, moving only to cells that are not lower; cells reached from both sides qualify.", time: "O(mn)", space: "O(mn)" },
    { name: "Per-cell search", intuition: "Run a search from every cell to check both oceans; simpler but repeats work.", time: "O((mn)^2)", space: "O(mn)" },
  ],
  examples: authoredExamples0.map((example) => ({
    label: example.label,
    input: JSON.stringify(example.input),
  })),
};

export default function Problem417Visualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <ParticleFlowView run={run} step={step} />}
      renderReasoning={({ run, step }) => (
        <p>
          {step.message} {run ? `Final answer:${run.answer.length} cell${run.answer.length === 1 ? "" : "s"} in the final result.` : ""}
        </p>
      )}
    />
  );
}
