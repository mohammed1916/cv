import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1624',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with s, a lowercase string (JSON)',
  url: 'https://leetcode.com/problems/largest-substring-between-two-equal-characters/',
  complexity: 'O(n) time and O(1) extra space for a fixed 26-letter alphabet: one pass that stores each first position.',
  examples: [
    { label: 'Repeat with gap', input: '{"s":"mnopqmrs"}' },
    { label: 'No repeat', input: '{"s":"abcd"}' },
    { label: 'Nested repeats', input: '{"s":"xyxzzxq"}' },
  ],
}

export default function EqualEndsVisualizer() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const s = run.input.s
    const snap = step.snapshot
    const gap = snap.gap
    return <>
      <IndexedSequence label="Letters" length={s.length} valueAt={i => s[i]}
        active={snap.i ?? -1}
        roleAt={i => (gap && (i === gap.from || i === gap.to) ? 'match' : gap && i > gap.from && i < gap.to ? 'between' : '')} />
      <output aria-label="First positions">{snap.first.length ? snap.first.map(e => `${e.letter}@${e.index}`).join('  ') : 'no letters stored yet'}</output>
      <output aria-label="Best gap">{`Best gap so far: ${snap.best}`}</output>
    </>
  }} renderReasoning={({ step }) => <>
    <p><strong>Remember the first copy:</strong> for each letter only its earliest position matters, because the widest gap for that letter always starts there.</p>
    <p><strong>Measure at each repeat:</strong> the letters strictly between two copies number their distance minus one.</p>
  </>} />
}
