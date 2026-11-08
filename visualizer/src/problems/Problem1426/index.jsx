import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1426',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'List of integers (JSON)',
  url: 'https://leetcode.com/problems/counting-elements/',
  complexity: 'O(n) expected time and O(n) space: build one set, then one lookup per occurrence.',
  examples: [
    { label: 'Chain with duplicates', input: '[1,1,2]' },
    { label: 'Mixed values', input: '[1,3,2,3,5,0]' },
    { label: 'No successors', input: '[7,7,9,9]' },
    { label: 'One value', input: '[0]' },
    { label: 'Equal values', input: '[5,5,5]' },
    { label: 'Largest values, 30 items', input: '[99,0,99,0,99,0,99,0,99,0,99,0,99,0,99,0,99,0,99,0,99,0,99,0,99,0,99,0,99,0]' },
    { label: 'Long run: 30 values', input: '[83,20,94,20,3,12,67,41,52,91,75,5,43,84,89,96,85,94,35,39,46,18,36,30,88,50,27,68,58,82]' },
  ],
}

export default function CountingElements() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const values = run.input
    const { current, present, count, value, successor, hit, counted } = step.snapshot
    const presentSet = new Set(present)
    return <>
      <div role="img" aria-label="Occurrences checked" style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {values.map((v, i) => <div key={i} data-index={i} style={{
          minWidth: 48, padding: '6px 8px', boxSizing: 'border-box', textAlign: 'center', fontFamily: 'monospace',
          border: `${i === current ? 2 : 1}px solid ${i === current ? 'var(--text)' : 'var(--border)'}`,
          background: i === current && counted ? 'var(--primary)' : i === current ? 'var(--surface2)' : 'transparent', color: i === current && counted ? 'var(--text)' : 'var(--text)',
        }}>{v}<div><small>{i}</small></div></div>)}
      </div>
      <p>{value === undefined ? 'Set of values built from the array.' : `Checking ${value}: successor ${successor} ${hit ? 'is present' : 'is absent'}.`}</p>
      <p>Set contents: {[...presentSet].sort((a, b) => a - b).join(', ')}</p>
      <p><strong>Count: {count}</strong></p>
    </>
  }} renderReasoning={({ step }) => <>
    <p><strong>Lookup, not search:</strong> a set answers whether a value is present without scanning the array again.</p>
    <p><strong>Occurrences count:</strong> each element is judged on its own, so repeated values add to the total.</p>
  </>} />
}
