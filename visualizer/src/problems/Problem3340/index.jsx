import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import IndexedSequence from "../../components/shared/IndexedSequence";
import { code, python, parseInput, buildTrace } from "./algorithm";

const definition = {
  number: "3340",
  phases: [
    { id: "setup", label: "Setup", description: "Start both running sums at zero." },
    { id: "scan", label: "Scan", description: "Read each digit with its index." },
    { id: "add", label: "Add", description: "Add the digit to the sum for its index parity." },
    { id: "done", label: "Result", description: "Compare the two sums." },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'JSON object: {"num": "1234"}',
  url: "https://leetcode.com/problems/check-balanced-string/",
  complexity: "O(n) time and O(1) extra space for a digit string of length n. The visualization accepts lengths up to 100.",
  examples: [
    { label: "Invented balanced", input: '{"num": "4411"}' },
    { label: "Invented unbalanced", input: '{"num": "2468"}' },
  ],
};

export default function Problem3340Visualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => (
        <>
          <IndexedSequence label="Digits of num" length={run.input.num.length}
            valueAt={index => run.input.num[index]} active={step.index}
            roleAt={index => (index % 2 === 0 ? "even index" : "odd index")} />
          <div aria-label="Even and odd index sums" style={{ display: "grid", gap: 6, margin: "8px 0", color: "var(--text)" }}>
            {[["even indexes", step.even, "var(--primary, #2563eb)"], ["odd indexes", step.odd, "var(--surface2, #94a3b8)"]].map(([label, value, color]) => {
              const top = Math.max(1, step.even, step.odd)
              return (
                <div key={label} style={{ display: "grid", gridTemplateColumns: "7rem 1fr 3rem", alignItems: "center", gap: 8 }}>
                  <span>{label}</span>
                  <div style={{ height: 14, background: "var(--surface2, transparent)", borderRadius: 4 }}>
                    <div style={{ width: `${Math.round((value / top) * 100)}%`, height: "100%", background: color, borderRadius: 4 }} />
                  </div>
                  <strong>{value}</strong>
                </div>
              )
            })}
          </div>
          <p>{step.even === step.odd ? "The two sums are equal so far." : "The sums are not equal so far."}</p>
        </>
      )}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  );
}
