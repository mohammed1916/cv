import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import { meta } from "./meta";
import { code, python, pythonLineMap, phases, inputLabel, complexity, examples, parseInput, buildTrace } from "./algorithm";

const definition = {
  number: meta.number,
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  pythonLineMap,
  inputLabel,
  url: `https://leetcode.com/problems/${meta.slug}/`,
  complexity,
  examples,
};

function Lanes({ levels, path, target }) {
  if (!levels.length) {
    return <p style={{ color: 'var(--text-dim)' }}>The skiplist is empty. Lane 0 is the bottom lane.</p>;
  }
  const visited = new Set(path.map(p => `${p.lane}:${p.val}`));
  const top = levels.length - 1;
  return <div role="img" aria-label="Skiplist lanes, top lane first" style={{ display: 'grid', gap: 6 }}>
    {Array.from({ length: top + 1 }, (_, k) => top - k).map(lane => (
      <div key={lane} data-lane={lane} style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
        <small style={{ width: 56, color: 'var(--text-dim)', fontFamily: 'monospace' }}>lane {lane}</small>
        <span style={{ fontFamily: 'monospace', color: 'var(--text-dim)' }}>head</span>
        {levels[lane].map((value, index) => {
          const isVisited = visited.has(`${lane}:${value}`);
          const isTarget = target !== null && value === target;
          return <span key={index} data-lane={lane} data-value={value} style={{
            minWidth: 34, padding: '4px 6px', boxSizing: 'border-box', textAlign: 'center', fontFamily: 'monospace',
            color: 'var(--text)',
            border: isTarget ? '2px solid var(--text)' : '1px solid var(--border)',
            background: isVisited ? 'color-mix(in srgb, var(--primary) 30%, transparent)' : 'var(--surface2)',
          }}>{value}</span>;
        })}
      </div>
    ))}
  </div>;
}

export default function DesignSkiplistWorkspace() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ step }) => {
        const snap = step.snapshot;
        return <>
          <Lanes levels={snap.levels} path={snap.path} target={snap.target} />
          <p style={{ marginTop: 8 }}>
            {snap.path.length
              ? `The walk moved through ${snap.path.length} node(s), dropping a lane whenever the next node is too large.`
              : 'The walk starts at the head of the top lane.'}
          </p>
          <output aria-label="Results">results: {snap.results.map(value => (value === null ? "null" : String(value))).join(", ") || "none yet"}</output>
        </>;
      }}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  );
}
