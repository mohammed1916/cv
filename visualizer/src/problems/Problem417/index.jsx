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
