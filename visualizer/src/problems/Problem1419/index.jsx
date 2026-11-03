import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { phases, parseInput, buildTrace, code, python, pythonLineMap } from './algorithm'

const definition = {
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  pythonLineMap,
  inputLabel: 'JSON string of the letters c, r, o, a and k (e.g. "ccrrooaakk")',
  url: 'https://leetcode.com/problems/minimum-number-of-frogs-croaking/',
  complexity: 'O(n) time and O(1) space: the state is five counters, one per stage of the croak.',
  examples: [
    { label: 'One frog', input: '"croak"' },
    { label: 'Two overlapping', input: '"ccrrooaakk"' },
    { label: 'Broken order', input: '"crrk"' },
  ],
}

const STAGES = ['c', 'r', 'o', 'a']

function FrogScene({ run, step }) {
  const snap = step.snapshot
  return <>
    <IndexedSequence label="Sound stream" length={run.input.length} valueAt={i => run.input[i]} active={snap.current} />
    <div className="algorithm-sequence">
      <h3>Frogs waiting for the next letter</h3>
      <ul>
        {STAGES.map((letter, i) => <li key={letter}>After {letter}, waiting for {STAGES[i + 1] ?? 'k'}: {snap.waiting[i]}</li>)}
      </ul>
      <p>Frogs mid-croak now: {snap.frogs} · largest so far: {snap.best}</p>
    </div>
  </>
}

export default function FrogCroak() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <FrogScene run={run} step={step} />}
      renderReasoning={({ step }) => <p>{phases.find(p => p.id === step.phase)?.description}</p>}
    />
  )
}
