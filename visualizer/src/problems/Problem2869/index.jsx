import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import IndexedSequence from "../../components/shared/IndexedSequence";
import { code, python, parseInput, buildTrace } from "./algorithm";

const definition = {
  phases: [
    { id: "setup", label: "Setup", description: "Prepare the set of values 1 to k." },
    { id: "take", label: "Take", description: "Remove the last element and update the needed set." },
    { id: "check", label: "Check", description: "See whether every value from 1 to k is collected." },
    { id: "done", label: "Result", description: "Report the number of removals." },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: "nums and k (JSON object with nums and integer k)",
  url: "https://leetcode.com/problems/minimum-operations-to-collect-elements/",
  complexity: "O(n) time and O(k) space. The visualization caps the array at 50 elements.",
  examples: [
    { label: "k = 2", input: '{"nums":[3,1,5,4,2],"k":2}' },
    { label: "k = 5", input: '{"nums":[3,1,5,4,2],"k":5}' },
    { label: "k = 3", input: '{"nums":[3,2,5,3,1],"k":3}' },
    { label: "Single element", input: "{\"nums\":[1],\"k\":1}" },
    { label: "Repeated values, k = 2", input: "{\"nums\":[1,1,2,2],\"k\":2}" },
    { label: "Permutation of all 50 values", input: "{\"nums\":[50,49,48,47,46,45,44,43,42,41,40,39,38,37,36,35,34,33,32,31,30,29,28,27,26,25,24,23,22,21,20,19,18,17,16,15,14,13,12,11,10,9,8,7,6,5,4,3,2,1],\"k\":50}" },
    { label: "Long run: 50 values, k = 25", input: "{\"nums\":[14,15,26,33,25,50,18,6,13,8,21,44,12,18,16,7,24,21,13,4,41,22,27,1,24,11,41,38,5,12,24,20,2,15,13,1,50,19,42,4,15,47,5,3,9,10,2,17,23,6],\"k\":25}" },
  ],
};

export default function MinimumOperationsCollectElements() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => (
        <>
          <IndexedSequence
            label="nums (removed from the end)"
            length={run.input.nums.length}
            valueAt={(i) => run.input.nums[i]}
            active={step.cursor}
            roleAt={(i) => (step.cursor >= 0 && i >= step.cursor ? "removed" : "")}
          />
          <div aria-label="Values still needed" style={{ display: "flex", flexWrap: "wrap", gap: 6, color: "var(--text)" }}>
            <span>Still needed:</span>
            {step.need.length === 0 && <span>none</span>}
            {step.need.map((v) => <span key={v} style={{ padding: "2px 8px", borderRadius: 999, border: "1px solid var(--border, currentColor)", background: "var(--primary)", color: "#fff" }}>{v}</span>)}
          </div>
          <div aria-label="Values collected" style={{ display: "flex", flexWrap: "wrap", gap: 6, color: "var(--text)" }}>
            <span>Collected:</span>
            {Array.from({ length: run.input.k }, (_, i) => i + 1).filter((v) => !step.need.includes(v)).map((v) => <span key={v} style={{ padding: "2px 8px", borderRadius: 999, border: "1px solid var(--border, currentColor)", background: "var(--surface2)" }}>{v}</span>)}
          </div>
        </>
      )}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  );
}
