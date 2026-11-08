import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import GraphTraversalView from "../../components/shared/GraphTraversalView";
import { code, python, pythonLineMap, parseInput, buildTrace } from "./algorithm";

const definition = {
  phases: [
    { id: "start", label: "Start", description: "Queue the boxes in hand." },
    { id: "loop", label: "Next box", description: "Take the next box from the queue." },
    { id: "skip", label: "Already open", description: "The box was opened earlier." },
    { id: "wait", label: "Locked", description: "The box is closed and no key is held yet." },
    { id: "open", label: "Open", description: "Collect candies from the box." },
    { id: "key", label: "Keys", description: "Take the keys inside the box." },
    { id: "contain", label: "Contents", description: "Queue the boxes inside this box." },
    { id: "done", label: "Result", description: "Return the total candies." },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  pythonLineMap,
  inputLabel: 'Boxes as JSON with status, candies, keys, containedBoxes and initialBoxes',
  url: "https://leetcode.com/problems/maximum-candies-you-can-get-from-boxes/",
  complexity: "O(n + total list length) time and O(n) space, where n is the number of boxes. The visualization accepts up to 24 boxes.",
  examples: [
    {
      label: "Keys unlock later boxes",
      input: JSON.stringify({
        status: [1, 0, 1, 0], candies: [7, 5, 4, 100], keys: [[], [], [1], []],
        containedBoxes: [[1, 2], [3], [], []], initialBoxes: [0],
      }),
    },
    {
      label: "Chain of keys",
      input: JSON.stringify({
        status: [1, 0, 0, 0, 0, 0], candies: [1, 1, 1, 1, 1, 1],
        keys: [[1, 2, 3, 4, 5], [], [], [], [], []],
        containedBoxes: [[1, 2, 3, 4, 5], [], [], [], [], []], initialBoxes: [0],
      }),
    },
    { label: 'Single locked box', input: '{"status":[0],"candies":[5],"keys":[[]],"containedBoxes":[[]],"initialBoxes":[]}' },
    { label: 'Largest candy values', input: '{"status":[1,1],"candies":[1000,1000],"keys":[[],[]],"containedBoxes":[[1],[]],"initialBoxes":[0]}' },
    { label: 'Long run: 24 boxes', input: '{"status":[0,0,1,0,0,1,0,0,1,1,0,1,0,1,1,0,0,0,1,1,1,1,0,0],"candies":[292,282,471,24,274,936,638,293,753,94,989,630,687,254,752,352,862,213,434,95,947,119,880,927],"keys":[[],[18],[11,15,19],[0,14,19],[11,19,23],[22],[5,6,8],[],[12,14,21],[4,10,13],[10,16,19],[],[9,12],[9,20],[8,13,19],[14],[2,20],[],[1,5,10],[15,19],[10],[1,14],[16],[16]],"containedBoxes":[[],[1],[9],[],[11,12],[15],[],[],[],[8],[],[0,14],[9,21],[],[],[8],[16,18],[9,21],[2,3],[12],[10],[9,18],[16],[]],"initialBoxes":[0,1]}' },
  ],
};

export default function MaxCandiesWorkspace() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => {
        const { containedBoxes } = run.input;
        const edges = [];
        containedBoxes.forEach((list, box) => list.forEach(child => edges.push([box, child])));
        const tags = {};
        run.input.candies.forEach((candy, box) => {
          tags[box] = `${candy}c ${run.input.status[box] ? "open" : "locked"}${step.hasKey[box] ? " · key" : ""}`;
        });
        return <GraphTraversalView title="Boxes and contents" n={run.input.status.length} edges={edges}
          directed current={step.current} visited={step.opened.flatMap((open, box) => (open ? [box] : []))}
          frontier={step.queue} frontierKind="stack" tags={tags} />;
      }}
      renderReasoning={({ step }) => <>
        <p>Total candies so far: {step.total}</p>
        <p>{step.message}</p>
      </>}
    />
  );
}
