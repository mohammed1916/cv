import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { phases, parseInput, buildTrace, code, python, pythonLineMap } from './algorithm'

function Window({ snapshot }) {
  const { s, letter, l, r, bad, tot, best } = snapshot
  return <div>
    <p>Target letter: <strong>{letter ?? '—'}</strong>{letter ? ` (${tot[letter]} copies in the whole string)` : ''} · differing letters in window: {bad} · best: {best}</p>
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
      {[...s].map((ch, i) => <span key={i} style={{
        width: 28, textAlign: 'center', border: '1px solid currentColor', borderRadius: 4, padding: '4px 0',
        background: r >= 0 && i >= l && i <= r ? 'rgba(8,145,178,0.25)' : 'transparent',
        fontWeight: letter && ch === letter ? 700 : 400,
      }}>{ch}</span>)}
    </div>
    <p>{r >= 0 ? `Window [${l}..${r}] shaded` : 'No window yet'}</p>
  </div>
}

const definition = {
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  pythonLineMap,
  inputLabel: 'Lowercase letters',
  complexity: 'O(26 × n) time with O(26) counts. The trace accepts up to 40 letters.',
  examples: [
    { label: 'One misplaced letter', input: 'aaabaaa' },
    { label: 'All distinct', input: 'abcdef' },
    { label: 'Two runs', input: 'aaabbb' },
  ],
}

export default function RepeatedRunWorkspace() {
  return <AlgorithmWorkspace
    definition={definition}
    renderVisual={({ step }) => <Window snapshot={step.snapshot} />}
    renderReasoning={({ step }) => <p>{step.message}</p>}
  />
}
