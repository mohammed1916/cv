import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '161',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with s and t (JSON)',
  url: 'https://leetcode.com/problems/one-edit-distance/',
  complexity: 'O(n) time and O(1) extra space for strings of length n: one scan with two indices.',
  examples: [
    { label: 'Insertion', input: '{"s":"cart","t":"cat"}' },
    { label: 'Replacement', input: '{"s":"abc","t":"axc"}' },
    { label: 'Identical', input: '{"s":"same","t":"same"}' },
  ],
}

export default function OneEdit() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { s, t, i } = step.snapshot
    const longer = t.length > s.length ? t : s
    const shorter = t.length > s.length ? s : t
    const cells = (word, label) => <div>
      <div>{label}</div>
      <div style={{ display: 'flex', gap: 4, fontFamily: 'monospace' }}>
        {[...word].map((ch, k) => <span key={k} style={{
          minWidth: 22, textAlign: 'center', padding: '4px 2px', border: `${k === i ? 2 : 1}px solid ${k === i ? 'var(--text)' : 'var(--border)'}`,
        }}>{ch}</span>)}
      </div>
    </div>
    return <>
      {cells(s, 's')}
      {cells(t, 't')}
      <p>{i === null ? 'Lengths are being compared.' : `Scan index: ${i}`}</p>
      <p>{s.length === t.length ? 'Same length: a replacement is the only single edit.' : `Length gap ${Math.abs(s.length - t.length)}: an insertion or deletion, where ${longer.length} > ${shorter.length}.`}</p>
    </>
  }} renderReasoning={() => <>
    <p><strong>Find the first difference:</strong> before it, both strings already agree and need no edit.</p>
    <p><strong>Then compare the tails:</strong> the one edit fixes the first difference, so the rest must match exactly.</p>
  </>} />
}
