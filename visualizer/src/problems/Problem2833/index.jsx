import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import IndexedSequence from "../../components/shared/IndexedSequence";
import { code, python, parseInput, buildTrace } from "./algorithm";

const definition = {
  number: "2833",
  phases: [
    { id: "count", label: "Count moves", description: "Count L, R and underscore moves." },
    { id: "result", label: "Result", description: "Combine the counts." },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: "moves (e.g. {\"moves\": \"L_RL__R\"})",
  url: "https://leetcode.com/problems/furthest-point-from-origin/",
  complexity: "O(n) time and O(1) extra space for moves length n. The visualization caps length at 50.",
  examples: [
    { label: "Example 1", input: "{\"moves\": \"L_RL__R\"}" },
    { label: "Example 2", input: "{\"moves\": \"_R__LL_\"}" },
    { label: "Example 3", input: "{\"moves\": \"_______\"}" },
    { label: "Single underscore", input: "{\"moves\":\"_\"}" },
    { label: "Single left move", input: "{\"moves\":\"L\"}" },
    { label: "Fifty symbols", input: "{\"moves\":\"LR_LR_LR_LR_LR_LR_LR_LR_LR_LR_LR_LR_LR_LR_LR_LR_LR\"}" },
    { label: "Long run: 50 seeded symbols", input: "{\"moves\":\"LRL_RRRLR__LLL___L___L_R___LLLRLLRL_LLLRLRLLR_RLL_\"}" },
  ],
};

const cell = { width: 26, height: 26, textAlign: "center", fontSize: 11, color: "var(--text)" };

// Number line from -n to n. The fixed moves land at one point; the free moves push the furthest point outward.
function NumberLine({ moves, fixed, furthest, reached }) {
  const n = moves.length;
  const points = Array.from({ length: 2 * n + 1 }, (_, i) => i - n);
  return <div style={{ overflowX: "auto" }}>
    <div role="img" aria-label={`Number line from -${n} to ${n}; fixed point ${fixed}; furthest ${furthest}`} style={{ display: "flex", gap: 2 }}>
      {points.map(p => {
        const isFixed = p === fixed, isFar = p === furthest, isReached = reached.includes(p);
        return <div key={p} data-point={p} title={`position ${p}`} style={{
          ...cell, border: "1px solid var(--surface2)", borderRadius: 4,
          background: isFar ? "var(--primary)" : isFixed ? "var(--border, transparent)" : isReached ? "var(--surface2)" : "transparent",
          color: isFar ? "#fff" : "var(--text)", fontWeight: isFar || isFixed ? 700 : 400,
        }}>{p === 0 ? "0" : isFar ? "far" : isFixed ? "fx" : ""}</div>;
      })}
    </div>
  </div>
}

export default function Problem2833Visualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => {
        const moves = run.input.moves;
        const left = moves.split("").filter(c => c === "L").length;
        const right = moves.split("").filter(c => c === "R").length;
        const free = moves.length - left - right;
        const fixed = right - left;
        const sign = fixed < 0 ? -1 : 1;
        const furthest = sign * (Math.abs(fixed) + free);
        const reached = [];
        if (step.phase === "result") {
          for (let p = Math.min(fixed, furthest); p <= Math.max(fixed, furthest); p += 1) reached.push(p);
        }
        return <>
          <IndexedSequence label="moves" length={moves.length} valueAt={i => moves[i]} active={step.active ?? -1}
            roleAt={i => step.roles?.[i] ?? ""} />
          <NumberLine moves={moves} fixed={fixed} furthest={step.phase === "result" ? furthest : null} reached={reached} />
          <output aria-label="Counts" style={{ color: "var(--text)" }}>{`L: ${left}, R: ${right}, free: ${free}, fixed point: ${fixed}`}</output>
        </>;
      }}
      renderReasoning={({ step }) => <p>{step.detail}</p>}
    />
  );
}
