import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { phases, parseInput, buildTrace, code, python } from './algorithm'

const definition = {
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Stone weights as a JSON array, such as [6,2,9,4]',
  url: 'https://leetcode.com/problems/last-stone-weight/',
  complexity: 'O(n^2 log n) time in this simple version, which re-sorts after each smash; a heap gives O(n log n). Space is O(n).',
  examples: [
    { label: 'Chain', input: '[6,2,9,4]' },
    { label: 'Equal pair', input: '[3,3]' },
    { label: 'Single stone', input: '[7]' },
    { label: 'Largest weight alone', input: '[1000]' },
    { label: 'Odd count of equal weights', input: '[5,5,5]' },
    { label: 'Largest input: twelve heaviest', input: '[1000,1000,1000,1000,1000,1000,1000,1000,1000,1000,1000,1000]' },
    { label: 'Long run: 12 stones', input: '[453,207,438,841,160,735,279,620,485,877,175,348]' },
  ],
}

function Stones({ step }) {
  const picked = step.snapshot.picked ?? []
  const all = [...step.snapshot.stones, ...picked]
  const top = Math.max(1, ...all)
  return <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, minHeight: 140 }}>
    {step.snapshot.stones.map((weight, index) => <div key={`s${index}`} data-weight={weight} style={{
      width: 36, height: (weight / top) * 120, background: 'var(--surface2)', border: '1px solid var(--border)',
      display: 'flex', alignItems: 'flex-start', justifyContent: 'center', color: 'var(--text)', fontFamily: 'monospace',
    }}>{weight}</div>)}
    {picked.map((weight, index) => <div key={`p${index}`} data-picked={weight} style={{
      width: 36, height: (weight / top) * 120, background: 'var(--surface2)', border: '2px solid var(--primary)',
      display: 'flex', alignItems: 'flex-start', justifyContent: 'center', color: 'var(--text)', fontFamily: 'monospace',
    }}>{weight}</div>)}
  </div>
}

export default function LastStoneWorkspace() {
  return <AlgorithmWorkspace
    definition={definition}
    renderVisual={({ step }) => <>
      <Stones step={step} />
      <output aria-label="Remaining stones">{`Remaining in list: [${step.snapshot.stones.join(', ')}]`}</output>
    </>}
    renderReasoning={({ step }) => <>
      <p>{step.message}</p>
      <p>Each round removes the two heaviest stones. Equal stones cancel completely; otherwise only their difference survives, so the list shrinks by one each round.</p>
    </>}
  />
}
