import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Read the query.' },
    { id: 'query', label: 'Query', description: 'Put Alice on the left building and Bob on the right.' },
    { id: 'direct', label: 'Direct', description: 'One of them can jump straight to the other.' },
    { id: 'scan', label: 'Scan', description: 'Look right of Bob for the first building taller than the threshold.' },
    { id: 'found', label: 'Answer', description: 'Record the building found, or -1.' },
    { id: 'done', label: 'Result', description: 'Every query is answered.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON {"heights": [6,4,8,5,2,7], "queries": [[0,1],[2,4]]}',
  url: 'https://leetcode.com/problems/find-building-where-alice-and-bob-can-meet/',
  complexity: 'O(n) scan per query in this visualization. The full problem uses offline sorting with a Fenwick tree for O((n + q) log n).',
  examples: [
    { label: 'Scan right of Bob', input: '{"heights":[3,7,2,5,9,4],"queries":[[0,2],[2,5],[4,3],[1,1]]}' },
    { label: 'Mixed queries', input: '{"heights":[4,9,1,6,2,8],"queries":[[2,0],[1,4],[3,5]]}' },
  ],
}

// Bars for every building; l is the left building of the query (the shorter reach), r is Bob's building, and the scan pointer walks right.
function Skyline({ run, step }) {
  const h = run.input.heights
  const max = Math.max(...h)
  return <figure aria-label="Buildings" style={{ margin: '0 0 12px' }}>
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 150, borderBottom: '1px solid var(--text)' }}>
      {h.map((v, k) => {
        const tag = [k === step.l ? 'l' : '', k === step.r ? 'r' : '', k === step.scan ? 'scan' : ''].filter(Boolean).join(' ')
        return <div key={k} style={{ flex: 1, textAlign: 'center', color: 'var(--text)' }}>
          <div style={{ height: `${(v / max) * 120}px`, background: k === step.scan ? 'var(--primary)' : 'var(--surface2)', border: step.need !== null && v > step.need ? '2px solid var(--primary)' : 'none', borderRadius: '4px 4px 0 0' }} />
          <small>{`[${k}] ${v}`}</small>
          <div><strong>{tag}</strong></div>
        </div>
      })}
    </div>
    {step.need !== null && <figcaption style={{ color: 'var(--text)' }}>{`Threshold ${step.need}: buildings outlined are taller than it.`}</figcaption>}
  </figure>
}

export default function FindBuildingAliceBob() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <Skyline run={run} step={step} />
    <output aria-label="Answers so far">{`Query ${step.query >= 0 ? step.query : '-'}; answers [${step.answers.join(', ')}]`}</output>
    <p role="status" style={{ color: 'var(--text)' }}>{step.message}</p>
  </>} renderReasoning={() => <>
    <p>If Bob's building is taller than Alice's, Alice can jump straight to it. Otherwise both need a building taller than Alice's height, to the right of Bob, and the first such building is the answer.</p>
  </>} />
}
