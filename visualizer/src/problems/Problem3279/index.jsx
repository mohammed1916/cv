import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import PistonTrackView from "./PistonTrackView";
import TotalsStripView from "./TotalsStripView";
import { code, python, parseInput, buildTrace } from "./algorithm.js";

const definition = {
  number: "3279",
  phases: [
    { id: "start", label: "Setup", description: "Find the length of one full cycle." },
    { id: "sweep", label: "Sweep", description: "Place every piston at this time and add the positions." },
    { id: "best", label: "New best", description: "This time gives the largest total so far." },
    { id: "done", label: "Result", description: "Report the largest total over one cycle." },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Object with height, positions and directions (e.g. {"height":5,"positions":[1,3,4],"directions":["up","down","up"]})',
  url: "https://leetcode.com/problems/maximum-total-area-occupied-by-pistons/",
  complexity: "O(height * k) time for k pistons, because the synchronized motion repeats every 2 * height integer steps and each step sums k positions. The visualization accepts height up to 20 and up to 8 pistons. Time is treated as integer steps, which covers every breakpoint of this piecewise-linear total.",
  examples: [
    { label: "Three pistons", input: '{"height":5,"positions":[1,3,4],"directions":["up","down","up"]}' },
    { label: "Two pistons", input: '{"height":3,"positions":[0,3],"directions":["up","down"]}' },
    { label: "One piston", input: '{"height":4,"positions":[2],"directions":["down"]}' },
    { label: 'Single piston at the floor', input: '{"height":1,"positions":[0],"directions":["up"]}' },
    { label: 'Equal positions tie', input: '{"height":4,"positions":[2,2],"directions":["up","down"]}' },
    { label: 'Largest height and pistons', input: '{"height":20,"positions":[0,20,10,5,15,1,19,7],"directions":["up","down","up","down","up","down","up","down"]}' },
    { label: 'Long run: eight generated pistons', input: '{"height":20,"positions":[10,19,17,9,20,2,3,1],"directions":["up","down","up","down","up","down","up","down"]}' },
  ],
};

export default function MaximumTotalAreaOccupiedByPistons() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <>
        <PistonTrackView run={run} step={step} />
        <TotalsStripView step={step} />
      </>}
      renderReasoning={({ run, step }) => (
        <p>
          {step.message} {run ? `Largest total: ${run.result}.` : ""}
        </p>
      )}
    />
  );
}
