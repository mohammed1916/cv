import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import IndexedSequence from "../../components/shared/IndexedSequence";
import { code, python, parseInput, buildTrace } from "./algorithm";

const definition = {
  phases: [
    { id: "setup", label: "Setup", description: "Start the three running values at 0." },
    { id: "scan", label: "Scan", description: "Visit the next value as the last index k." },
    { id: "answer", label: "Answer", description: "Combine the best difference with the current value." },
    { id: "diff", label: "Difference", description: "Update the best (nums[i] - nums[j]) seen so far." },
    { id: "prefix", label: "Prefix", description: "Update the largest value seen so far." },
    { id: "done", label: "Result", description: "Report the best triplet value." },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: "nums (JSON object with nums, 3 to 30 integers)",
  url: "https://leetcode.com/problems/maximum-value-of-an-ordered-triplet-i/",
  complexity: "O(n) time and O(1) space. The visualization caps the array at 30 elements.",
  examples: [
    { label: "Example 1", input: '{"nums":[12,6,1,2,7]}' },
    { label: "Example 2", input: '{"nums":[1,10,3,4,19]}' },
  ],
};

export default function MaximumValueOrderedTripletI() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => (
        <>
          <IndexedSequence
            label="nums"
            length={run.input.nums.length}
            valueAt={(i) => run.input.nums[i]}
            active={step.cursor}
            roleAt={(i) => (step.cursor >= 0 && i < step.cursor ? "seen" : "")}
          />
          <table aria-label="Largest value before each index" style={{ borderCollapse: "collapse", width: "100%", color: "var(--text)" }}>
            <thead><tr>{["index j", "value", "largest before j", "best difference so far"].map((h) => <th key={h} scope="col" style={{ textAlign: "left", padding: "4px 8px", borderBottom: "2px solid var(--border, currentColor)" }}>{h}</th>)}</tr></thead>
            <tbody>{run.input.nums.slice(0, step.cursor >= 0 ? step.cursor + 1 : 0).map((v, j) => {
              const before = j === 0 ? "-" : Math.max(...run.input.nums.slice(0, j));
              return <tr key={j} data-current={j === step.cursor} style={{ background: j === step.cursor ? "var(--surface2)" : "transparent" }}>
                <td style={{ padding: "4px 8px" }}>{j}</td><td style={{ padding: "4px 8px" }}>{v}</td><td style={{ padding: "4px 8px" }}>{before}</td>
                <td style={{ padding: "4px 8px" }}>{j === step.cursor ? step.bestDiff : ""}</td>
              </tr>;
            })}</tbody>
          </table>
          <p style={{ color: "var(--text)" }}>Answer {step.answer}. Best difference {step.bestDiff}. Best prefix {step.bestPrefix}.</p>
        </>
      )}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  );
}
