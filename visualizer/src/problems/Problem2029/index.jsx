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
    { label: 'Single stone', input: '[1]' }, { label: "One stone", input: "[7]" }, { label: "Equal stones", input: "[5,5,5,5]" }, { label: "Largest weights", input: "[10000,1,10000,1,10000,1,10000,1,10000,1,10000,1,10000,1,10000,1,10000,1,10000,1,10000,1,10000,1,10000,1,10000,1,10000,1,10000,1,10000,1,10000,1,10000,1,10000,1,10000,1,10000,1,10000,1,10000,1,10000,1,10000,1,10000,1,10000,1,10000,1,10000,1]" }, { label: "Long run: 60 stones", input: "[5308,6464,8632,9228,9514,6661,8112,7764,3751,9707,6931,4326,4118,1390,7866,3560,321,4662,646,11,4428,681,8919,3370,9992,9551,8283,2557,1056,4658,6161,8798,3099,7024,6804,348,416,8577,7204,4031,7004,5736,2193,1233,450,7231,9513,8518,879,2555,8145,5519,9473,9961,5658,5265,3613,5396,2886,4584]" },
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
