import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import ElevatorShaftView from "./ElevatorShaftView";
import { code, python, parseInput, buildTrace, phases } from "./algorithm.js";

const definition = {
  number: "4029",
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Object with start (floor) and requests ([arrival, floor] pairs)',
  url: "https://leetcode.com/problems/elevator-requests-iv/",
  complexity: "O(2^m * m^2) time and O(2^m * m) space for m requests. The visualization caps m at 6. Each request is served the first time the elevator reaches its floor at or after its arrival, so the search only needs to order the requests.",
  examples: [
    { label: "Two requests out of order", input: '{"start":0,"requests":[[0,3],[2,1]]}' },
    { label: "Late arrivals", input: '{"start":5,"requests":[[10,5],[3,8],[12,2]]}' },
    { label: "Single request", input: '{"start":0,"requests":[[4,4]]}' },
  ],
};

export default function Problem4029Visualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <ElevatorShaftView run={run} step={step} />}
      renderReasoning={({ step }) => <p>{step.message} The table keeps, for each set of served requests and each last request, the earliest time that set can be finished.</p>}
    />
  );
}
