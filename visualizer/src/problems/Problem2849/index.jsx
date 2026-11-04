import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import { code, python, parseInput, buildTrace } from "./algorithm";

const definition = {
  number: "2849",
  phases: [
    { id: "distance", label: "Distances", description: "Compute the horizontal and vertical distances." },
    { id: "check", label: "Check", description: "Compare with the time." },
    { id: "result", label: "Result", description: "Report reachability." },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: "sx, sy, fx, fy, t (e.g. {\"sx\": 2, \"sy\": 4, \"fx\": 7, \"fy\": 7, \"t\": 6})",
  url: "https://leetcode.com/problems/determine-if-a-cell-is-reachable-at-a-given-time/",
  complexity: "O(1) time and O(1) space.",
  examples: [
    { label: "Example 1", input: "{\"sx\": 2, \"sy\": 4, \"fx\": 7, \"fy\": 7, \"t\": 6}" },
    { label: "Example 2", input: "{\"sx\": 3, \"sy\": 1, \"fx\": 7, \"fy\": 3, \"t\": 3}" },
  ],
};

const row = { display: "grid", gridTemplateColumns: "120px 1fr 56px", gap: 8, alignItems: "center", color: "var(--text)" };

// Bars are drawn on one scale: the larger of the needed steps and the time allowed.
function Bar({ label, value, scale, highlight = false }) {
  const pct = scale > 0 ? (value / scale) * 100 : 0;
  return <div style={row}>
    <span>{label}</span>
    <div style={{ background: "var(--surface2)", borderRadius: 6, height: 14, overflow: "hidden" }}>
      <div style={{ width: `${Math.min(100, pct)}%`, height: "100%", background: highlight ? "var(--primary)" : "var(--border, currentColor)" }} />
    </div>
    <strong>{value}</strong>
  </div>;
}

export default function Problem2849Visualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => {
        const { sx, sy, fx, fy, t } = run.input;
        const dx = Math.abs(fx - sx);
        const dy = Math.abs(fy - sy);
        const need = Math.max(dx, dy);
        const scale = Math.max(need, t, 1);
        const reached = step.phase === "result";
        const verdict = dx === 0 && dy === 0 ? t !== 1 : need <= t;
        return (
          <section aria-label="Distance against time" style={{ display: "grid", gap: 8 }}>
            <Bar label="horizontal |dx|" value={dx} scale={scale} highlight={step.active === 0} />
            <Bar label="vertical |dy|" value={dy} scale={scale} highlight={step.active === 1} />
            <Bar label="steps needed" value={need} scale={scale} highlight={reached} />
            <Bar label="time t" value={t} scale={scale} highlight={step.active === 2} />
            {reached && <output aria-label="Verdict" style={{ color: "var(--text)" }}>{`Reachable: ${verdict}`}</output>}
          </section>
        );
      }}
      renderReasoning={({ step }) => <p>{step.detail}</p>}
    />
  );
}
