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
