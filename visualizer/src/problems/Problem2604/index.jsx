import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import HenReachView from "./HenReachView";
import AnswerRangeBar from "../../components/shared/AnswerRangeBar";
import { code, python, parseInput, buildTrace, pythonLineMap, phases } from "./algorithm.js";

const definition = {
  number: "2604",
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  pythonLineMap,
  inputLabel: 'Hens and grains (e.g. {"hens":[3,8],"grains":[0,1,5,10,12]})',
  url: "https://leetcode.com/problems/minimum-time-to-eat-all-grains/description/",
  complexity: "O((H + G) log M) time, where H hens, G grains and M twice the largest position, using a linear greedy check inside a binary search on time; O(H + G) extra space. The visualization caps the input at 6 hens, 8 grains and positions 0 to 30.",
  examples: [
    { label: "One hen, grains on both sides", input: '{"hens":[3],"grains":[1,2,3]}' },
    { label: "Two hens split the grains", input: '{"hens":[3,8],"grains":[0,1,5,10,12]}' },
    { label: "Hens on opposite ends", input: '{"hens":[0,6],"grains":[2,4,8]}' },
    { label: "No grains", input: '{"hens":[5],"grains":[]}' },
  ],
};

export default function Problem2604Visualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <>
        {step.view && step.view.lo !== null && step.view.lo !== undefined && (
          <AnswerRangeBar title="Time search" min={0} max={2 * Math.max(...run.input.hens, ...run.input.grains)} low={step.view.lo} high={step.view.hi} probe={step.view.mid} />
        )}
        <HenReachView run={run} step={step} />
      </>}
      renderReasoning={({ run, step }) => (
        <p>
          {step.message} {run ? `Final answer: ${run.result}.` : ""}
        </p>
      )}
    />
  );
}
