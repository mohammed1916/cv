import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1465',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Cake as a JSON object',
  url: 'https://leetcode.com/problems/maximum-area-of-a-piece-of-cake-after-horizontal-and-vertical-cuts/',
  complexity: 'O(H log H + W log W) time for sorting the cut lists, plus O(1) extra space for the gap scan.',
  examples: [
    { label: 'Sample', input: '{"h":10,"w":6,"horizontalCuts":[3,7],"verticalCuts":[2]}' },
    { label: 'No cuts', input: '{"h":8,"w":8,"horizontalCuts":[],"verticalCuts":[]}' },
    { label: 'Dense', input: '{"h":12,"w":9,"horizontalCuts":[1,2,9],"verticalCuts":[4,5]}' },
    { label: 'No cuts', input: '{"h":2,"w":2,"horizontalCuts":[],"verticalCuts":[]}' },
    { label: 'Equal gaps', input: '{"h":4,"w":4,"horizontalCuts":[1,2,3],"verticalCuts":[1,2,3]}' },
    { label: 'Largest sheet', input: '{"h":1000000000,"w":1000000000,"horizontalCuts":[1,999999999],"verticalCuts":[500000000]}' },
    { label: 'Long run: 40 cuts per side', input: '{"h":1000,"w":600,"horizontalCuts":[66,74,154,173,213,231,269,271,291,293,307,325,330,360,393,425,471,497,523,524,571,602,610,683,684,734,761,777,803,863,865,872,891,892,940,952,973,977,978,990],"verticalCuts":[8,35,53,59,67,75,81,99,103,110,125,158,188,196,250,268,272,291,302,322,338,344,362,386,389,411,415,418,424,439,440,446,450,451,461,493,518,567,570,594]}' },
  ],
}

export default function MaxAreaAfterCuts() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => {
    const s = step.snapshot
    const rail = (label, points, index) => <div key={label} style={{ marginBottom: 12 }}>
      <strong>{label}</strong>
      <div role="img" aria-label={`${label} points`} style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 4 }}>
        {points.map((p, i) => <span key={i} style={{
          padding: '4px 8px', fontFamily: 'monospace', border: '1px solid var(--border)',
          background: s.axis === label.toLowerCase() && index !== null && (i === index || i === index + 1) ? '#bbf7d0' : 'transparent', color: '#1c1917',
        }}>{p}</span>)}
      </div>
    </div>
    return <>
      {s.points.length > 0 && rail(s.axis === 'vertical' ? 'Vertical' : 'Horizontal', s.points, s.index)}
      <p>{`Best horizontal gap: ${s.best.horizontal}. Best vertical gap: ${s.best.vertical}.`}</p>
      {s.gaps.length > 0 && <p>{`Gaps measured on this axis: ${s.gaps.join(', ')}`}</p>}
    </>
  }} renderReasoning={() => <>
    <p><strong>Largest piece per axis:</strong> the biggest rectangle takes the biggest gap in each direction, because every cut runs all the way across.</p>
    <p><strong>Edges:</strong> adding 0 and the full length makes the first and last pieces count.</p>
  </>} />
}
