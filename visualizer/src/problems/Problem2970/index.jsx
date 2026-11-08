import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import IndexedSequence from "../../components/shared/IndexedSequence";
import { code, python, parseInput, buildTrace } from "./algorithm";

const definition = {
  phases: [
    { id: "prefix", label: "Prefix", description: "Find the longest strictly increasing prefix." },
    { id: "suffix", label: "Suffix", description: "Find the longest strictly increasing suffix." },
    { id: "scan", label: "Scan", description: "Choose the kept prefix length a." },
    { id: "move", label: "Move b", description: "Advance the suffix start to a valid position." },
    { id: "add", label: "Add", description: "Add the number of valid removals." },
    { id: "done", label: "Result", description: "Return the count." },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'JSON object: {"nums": [8, 7, 6, 6]}',
  url: "https://leetcode.com/problems/count-the-number-of-incremovable-subarrays-i/",
  complexity: "O(n) time and O(1) extra space after the two scans. The visualization caps n at 50 and values at 1000.",
  examples: [
    { label: "Example 1", input: '{"nums": [8, 7, 6, 6]}' },
    { label: "Example 2", input: '{"nums": [6, 5, 7, 8]}' },
    { label: "Single element", input: '{"nums":[5]}' },
    { label: "Equal values", input: '{"nums":[4,4,4,4]}' },
    { label: "Largest values at both ends", input: '{"nums":[1000,1,1000,1000]}' },
    { label: "Long run: 50 values", input: '{"nums":[413,278,469,691,786,979,366,732,791,845,288,778,180,329,955,819,810,853,316,539,612,228,46,906,453,375,44,650,480,786,89,626,130,324,948,780,656,461,164,950,264,285,535,299,665,824,403,151,73,75]}' },
  ],
};

export default function IncremovableSubarraysVisualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => (
        <>
          <IndexedSequence
            label="nums"
            length={run.input.nums.length}
            valueAt={(i) => run.input.nums[i]}
            active={step.b ?? -1}
            roleAt={(i) =>
              step.a !== null && i === step.a ? "l" : step.b !== null && i === step.b ? "r" : step.a !== null && i < step.a ? "kept prefix" : step.q !== null && i >= step.q ? "kept suffix" : step.a !== null && step.b !== null && i > step.a && i < step.b ? "removed" : ""
            }
          />
          <p>
            Prefix ends at p = {step.p} · suffix starts at q = {step.q} · a = {step.a ?? "-"} · b = {step.b ?? "-"} · count {step.count}
          </p>
        </>
      )}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  );
}
