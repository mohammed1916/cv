import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import IndexedSequence from "../../components/shared/IndexedSequence";
import { code, python, pythonLineMap, parseInput, buildTrace, phases } from "./algorithm";

const rankOf = (preferences, u, w) => preferences[u].indexOf(w);

function PairCheck({ preferences, pairs, partner, x, u }) {
  if (x < 0 || u < 0 || partner === undefined) return null;
  const y = partner[x];
  const v = partner[u];
  const xPrefersU = rankOf(preferences, x, u) < rankOf(preferences, x, y);
  const uPrefersX = rankOf(preferences, u, x) < rankOf(preferences, u, v);
  const row = { color: "var(--text)", padding: "4px 0" };
  return (
    <section aria-label="Pair check" style={{ margin: "10px 0", color: "var(--text)" }}>
      <p>Friend {x} is paired with {y}. Candidate {u} is paired with {v}.</p>
      <p style={row}>{x} prefers {u} over {y}: <strong>{xPrefersU ? "yes" : "no"}</strong></p>
      <p style={row}>{u} prefers {x} over {v}: <strong>{uPrefersX ? "yes" : "no"}</strong></p>
      <p style={row}>Both yes means {x} is unhappy.</p>
    </section>
  );
}

const definition = {
  number: "1583",
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  pythonLineMap,
  inputLabel: 'Input JSON: {"n", "preferences", "pairs"}',
  url: "https://leetcode.com/problems/count-unhappy-friends/",
  complexity: "O(n^2) time and O(n^2) space for n friends. The visualization caps n at 40.",
  examples: [
    { label: "Sample A", input: JSON.stringify({ n: 4, preferences: [[2, 1, 3], [2, 0, 3], [0, 1, 3], [0, 1, 2]], pairs: [[0, 1], [2, 3]] }) },
    { label: "Four friends, crossed", input: JSON.stringify({ n: 4, preferences: [[1, 3, 2], [0, 2, 3], [1, 3, 0], [0, 1, 2]], pairs: [[0, 2], [1, 3]] }) },
    { label: "Four friends", input: JSON.stringify({ n: 4, preferences: [[3, 1, 2], [0, 2, 3], [1, 0, 3], [2, 1, 0]], pairs: [[0, 3], [1, 2]] }) },
  ],
};

export default function CountUnhappyFriendsVisualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => (
        <>
          <IndexedSequence
            label={`Friends (n = ${run.input.n}); each cell shows the current partner`}
            length={run.input.n}
            active={step.snapshot.x}
            valueAt={index => `with ${step.snapshot.partner[index]}`}
            roleAt={index => (index === step.snapshot.u ? "candidate" : step.snapshot.unhappy[index] ? "unhappy" : "")}
          />
          <PairCheck preferences={run.input.preferences} pairs={run.input.pairs} partner={step.snapshot.partner} x={step.snapshot.x} u={step.snapshot.u} />
        </>
      )}
      renderReasoning={({ run, step }) => (
        <p>{`Unhappy friends found so far: ${step.snapshot.unhappy.filter(Boolean).length} of ${run.input.n}.`}</p>
      )}
    />
  );
}
