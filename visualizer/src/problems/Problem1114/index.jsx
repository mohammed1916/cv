import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import IndexedSequence from "../../components/shared/IndexedSequence";
import { code, python, pythonLineMap, parseInput, buildTrace } from "./algorithm";

const METHOD_NAMES = ["first()", "second()", "third()"];

const definition = {
  number: "1114",
  phases: [
    { id: "arrive", label: "Arrive", description: "A thread calls its method." },
    { id: "wait", label: "Wait", description: "The method waits for the previous word to print." },
    { id: "print", label: "Print", description: "The method prints its word and releases the next waiting method." },
    { id: "done", label: "Return", description: "Return the full printed text." },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  pythonLineMap,
  inputLabel: 'JSON object with nums, a permutation of [1, 2, 3] (e.g. {"nums":[1,3,2]})',
  url: "https://leetcode.com/problems/print-in-order/",
  complexity: "Each method waits at most once. Real thread timing is unpredictable; the playback replays one deterministic arrival order.",
  examples: [
    { label: "nums = [1,2,3]", input: '{"nums":[1,2,3]}' },
    { label: "nums = [1,3,2]", input: '{"nums":[1,3,2]}' },
  ],
};

export default function PrintInOrderVisualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => (
        <>
          <IndexedSequence
            label="Calls in arrival order"
            length={run.input.nums.length}
            valueAt={(index) => `${run.input.nums[index]} · ${METHOD_NAMES[run.input.nums[index] - 1]}`}
            roleAt={(index) => step.statuses[index]}
            active={step.current ?? -1}
          />
          <IndexedSequence
            label="Printed output"
            length={run.order.length}
            valueAt={(index) => (index < step.printedCount ? run.order[index] : "·")}
            active={step.printedCount}
          />
        </>
      )}
      renderReasoning={({ step }) => (
        <>
          <p>The three methods run on separate threads, so their start order is not guaranteed. Events make second() wait for first(), and third() wait for second().</p>
          <p>Playback replays a fixed arrival order so every step is visible. Whatever the arrival order, the printed text is always firstsecondthird.</p>
          <p>{step.message}</p>
        </>
      )}
    />
  );
}
