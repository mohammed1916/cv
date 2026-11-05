import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const LETTERS = Array.from({ length: 26 }, (_, i) => String.fromCharCode(97 + i))

const definition = {
  number: '1974',
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Lowercase word (e.g. bza)',
  url: 'https://leetcode.com/problems/minimum-time-to-type-word-using-special-typewriter/',
  complexity: 'O(n) time for a word of n letters, with constant work per letter.',
  examples: [
    { label: 'Short word', input: 'abc' },
    { label: 'Wraps around', input: 'bza' },
  ],
}

export default function Problem1974Visualizer() {
  return <AlgorithmWorkspace
    definition={definition}
    renderVisual={({ step }) => <>
      <div aria-label="Typewriter dial" style={{ display: 'flex', flexWrap: 'wrap', gap: 4, maxWidth: 360 }}>
        {LETTERS.map((ch, i) => <span key={ch} style={{
          width: 28, height: 28, display: 'grid', placeItems: 'center', borderRadius: 14,
          border: '1px solid var(--border)',
          background: i === step.pointer ? 'var(--primary)' : i === step.target ? 'color-mix(in srgb, var(--primary) 30%, var(--surface2))' : 'var(--surface2)',
          color: i === step.pointer ? 'var(--on-primary, #fff)' : 'var(--text)',
        }}>{ch}</span>)}
      </div>
      <p>Pointer on <strong>{LETTERS[step.pointer]}</strong>{step.letter ? <> , next letter <strong>{step.letter}</strong> ({step.moves} move{step.moves === 1 ? '' : 's'})</> : ''}.</p>
      <output aria-label="Seconds so far">Seconds: {step.seconds}</output>
    </>}
    renderReasoning={({ step }) => <p>{step.message}</p>}
  />
}
