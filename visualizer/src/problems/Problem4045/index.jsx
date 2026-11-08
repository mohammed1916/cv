import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import RobotLineView from "./RobotLineView";
import { code, python, parseInput, buildTrace, phases } from "./algorithm.js";

const definition = {
  number: "4045",
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Object with positions (strictly increasing), speeds and distance',
  url: "https://leetcode.com/problems/count-robot-groups/",
  complexity: "O(n^2) time per merge round in this simulation, O(n^3) overall for n robots: each merge rescans adjacent pairs. Times are kept as exact fractions. The visualization caps the line at 8 robots with small values; the official bounds are not verified in this draft.",
  examples: [
    { label: "Early merge", input: '{"positions":[1,3,6],"speeds":[2,1,1],"distance":2}' },
    { label: "Catch up later", input: '{"positions":[1,4,9],"speeds":[3,1,2],"distance":1}' },
    { label: "Tight line", input: '{"positions":[1,2,3],"speeds":[1,1,1],"distance":1}' },
    { label: "One robot", input: "{\"positions\":[1],\"speeds\":[1],\"distance\":1}" },
    { label: "Equal speeds", input: "{\"positions\":[2,4],\"speeds\":[3,3],\"distance\":9}" },
    { label: "Largest positions and speeds", input: "{\"positions\":[1,1000000000],\"speeds\":[1000000000,1],\"distance\":1000000000}" },
    { label: "Long run: eight robots", input: "{\"positions\":[9094,104720,151849,208611,246693,276206,283927,378321],\"speeds\":[46,51,23,78,12,70,32,88],\"distance\":500}" },
  ],
};

export default function Problem4045Visualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <RobotLineView run={run} step={step} />}
      renderReasoning={({ step }) => <p>{step.message} A merged group moves with the speed of its rightmost robot, so the next merge is computed from that robot only.</p>}
    />
  );
}
