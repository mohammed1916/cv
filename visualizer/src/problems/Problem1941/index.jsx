import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1941',
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Lowercase string (e.g. xxyyzz)',
  url: 'https://leetcode.com/problems/check-if-all-characters-have-equal-number-of-occurrences/',
  complexity: 'O(n) time and O(1) extra space, since there are at most 26 letters.',
  examples: [
    { label: 'Equal counts', input: 'xxyyzz' },
    { label: 'Unequal counts', input: 'xxxyz' },
    { label: 'Single letter', input: 'a' },
    { label: 'Equal counts, four letters', input: 'aabbccdd' },
    { label: 'Long run: 40 letters', input: 'edyxwbabatydmjkvyhqfibylgfwdgxorcnklinqt' },
  ],
}

export default function Problem1941Visualizer() {
  return <AlgorithmWorkspace
    definition={definition}
    renderVisual={({ step }) => {
      const entries = Object.entries(step.count).sort(([a], [b]) => a.localeCompare(b))
      return <>
        <div aria-label="Letter counts" style={{ display: 'grid', gap: 6 }}>
          {entries.length === 0 && <em>No letters counted yet.</em>}
          {entries.map(([letter, n]) => <div key={letter} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <strong style={{ width: 22 }}>{letter}</strong>
            <div style={{ height: 16, width: n * 22, borderRadius: 4, background: letter === step.letter ? 'var(--primary)' : 'var(--surface2)', border: '1px solid var(--border)' }} />
            <span>{n}</span>
          </div>)}
        </div>
        {step.distinct && <p>Distinct frequencies: <strong>{step.distinct.join(', ')}</strong></p>}
      </>
    }}
    renderReasoning={({ step }) => <p>{step.message}</p>}
  />
}
