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
  inputLabel: 'JSON string of 0 and 1 characters (e.g. "10010")',
  url: 'https://leetcode.com/problems/maximum-score-after-splitting-a-string/',
  complexity: 'O(n) time and O(1) extra space: one pass moves the cut and keeps two running counts.',
  examples: [
    { label: 'Mixed', input: '"10010"' },
    { label: 'All ones', input: '"11111"' },
    { label: 'All zeros', input: '"0000"' },
  ],
}

function SplitScene({ run, step }) {
  const snap = step.snapshot
  const { input } = run
  return <>
    <IndexedSequence label="Binary string" length={input.length} valueAt={i => input[i]} active={snap.current}
      roleAt={i => (snap.current < 0 ? '' : i <= snap.current ? 'left' : 'right')} />
    <p>Left zeros: {snap.zerosLeft} · right ones: {snap.onesRight} · best: {snap.best}{snap.score !== null ? ` · this split: ${snap.score}` : ''}</p>
  </>
}

export default function SplitScore() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <SplitScene run={run} step={step} />}
      renderReasoning={({ step }) => <p>{phases.find(p => p.id === step.phase)?.description}</p>}
    />
  )
}
