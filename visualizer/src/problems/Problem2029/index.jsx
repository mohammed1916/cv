import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '2029',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Stone values (JSON)',
  url: 'https://leetcode.com/problems/stone-game-ix/',
  complexity: 'O(n) time: one pass to count residues modulo 3.',
  examples: [
    { label: 'Odd zeros', input: '[3,6,1,2]' },
    { label: 'Even zeros', input: '[3,6,2,1]' },
    { label: 'Single stone', input: '[1]' },
  ],
}

export default function StoneGameIX() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => {
    const { stones, count } = step.snapshot
    const names = ['residue 0', 'residue 1', 'residue 2']
    return <>
      <div aria-label="Stones by residue" style={{ display: 'grid', gap: 6 }}>
        {count.map((c, r) => <div key={r} style={{ display: 'flex', gap: 4, alignItems: 'center', color: 'var(--text)' }}>
          <span style={{ width: 90 }}>{names[r]}</span>
          {Array.from({ length: c }, (_, i) => <span key={i} style={{ width: 14, height: 14, borderRadius: 7, background: 'var(--primary-glow)', border: '1px solid var(--border)' }} />)}
          <strong>{c}</strong>
        </div>)}
      </div>
      <p>Stones: {stones.join(', ')}.</p>
    </>
  }} renderReasoning={() => <p>Only residues modulo 3 decide the game. The parity of the residue-0 stones changes who is forced to finish the removals, which gives the two conditions.</p>} />
}
