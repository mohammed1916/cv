import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import IndexedSequence from "../../components/shared/IndexedSequence";
import { code, python, pythonLineMap, parseInput, buildTrace } from "./algorithm";

const definition = {
  number: "1117",
  phases: [
    { id: "arrive", label: "Arrive", description: "A hydrogen or oxygen thread starts." },
    { id: "wait", label: "Wait", description: "The thread waits for a free permit for its element." },
    { id: "barrier", label: "Barrier", description: "The thread holds a permit and waits until a full molecule has gathered." },
    { id: "release", label: "Release", description: "The barrier opens and the group prints its atoms." },
    { id: "done", label: "Return", description: "Return the released atoms in order." },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  pythonLineMap,
  inputLabel: 'JSON object with water: H and O letters, length 3n, 2n H and n O (e.g. {"water":"HOH"})',
  url: "https://leetcode.com/problems/building-h2o/",
  complexity: "O(n) time and O(n) space for n molecules. Playback uses a fixed arrival order; any valid order forms groups of two H and one O.",
  examples: [
    { label: "HOH", input: '{"water":"HOH"}' },
    { label: "OOHHHH", input: '{"water":"OOHHHH"}' },
  ],
};

export default function BuildingH2OVisualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => (
        <>
          <IndexedSequence
            label="Threads in arrival order"
            length={run.input.water.length}
            valueAt={(index) => run.input.water[index]}
            roleAt={(index) => step.statuses[index]}
            active={step.current ?? -1}
          />
          <IndexedSequence
            label="Released atoms"
            length={run.order.length}
            valueAt={(index) => (index < step.printedCount ? run.order[index] : "·")}
            active={step.printedCount}
          />
          <dl aria-label="Permits">
            <dt>Hydrogen permits free</dt>
            <dd>{step.hPermits} of 2</dd>
            <dt>Oxygen permits free</dt>
            <dd>{step.oPermits} of 1</dd>
          </dl>
        </>
      )}
      renderReasoning={({ step }) => (
        <>
          <p>Each hydrogen and oxygen thread takes a permit before it can join the barrier. Only two H and one O can hold permits at a time, so the barrier opens only when a complete H2O group has gathered.</p>
          <p>The printed order within a group can vary; the problem only requires that every consecutive group of three contains two H and one O.</p>
          <p>{step.message}</p>
        </>
      )}
    />
  );
}
