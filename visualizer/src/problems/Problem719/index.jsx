import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import AnswerRangeBar from '../../components/shared/AnswerRangeBar'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Distance range', description: 'The answer lies between 0 and the largest gap.' },
    { id: 'count', label: 'Count pairs', description: 'Count pairs within the midpoint distance.' },
    { id: 'done', label: 'Complete', description: 'The search has converged.' },
  ],
  parse: parseInput, build: buildTrace, code, python, inputLabel: 'Input (JSON object with nums and k)',
  url: 'https://leetcode.com/problems/find-k-th-smallest-pair-distance/',
  complexity: 'O(n log n + n · log W) time, where W is the value range, and O(1) extra space after sorting.',
  examples: [
    { label: 'Classic', input: '{"nums":[1,3,1],"k":1}' },
    { label: 'Spread', input: '{"nums":[1,6,1],"k":3}' },
  ],
}

const cell = { border: '1px solid var(--border)', padding: '4px 8px', fontFamily: 'monospace', color: 'var(--text)', textAlign: 'center' }

export default function KthPairDistance() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const sorted = [...run.input.nums].sort((x, y) => x - y)
    const hasMid = step.mid !== null && step.mid !== undefined
    const hi = sorted[sorted.length - 1] - sorted[0]
    return <>
      <AnswerRangeBar title="Distance search" min={0} max={Math.max(1, hi)} low={step.lo} high={step.hi}
        probe={hasMid ? step.mid : null} verdict={hasMid ? step.count >= run.input.k : null} />
      <output aria-label="Search state" style={{ display: 'block', color: 'var(--text)' }}>
        Distance range [{step.lo}, {step.hi}]{hasMid ? ` · mid ${step.mid} · ${step.count} pairs ≤ mid (k = ${run.input.k})` : ''}
      </output>
      <div role="img" aria-label="Sorted values" style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8 }}>
        {sorted.map((v, i) => <div key={i} style={{ ...cell, minWidth: 40, border: `1px solid var(--border)` }}>
          <div>{v}</div><small>{i}</small>
        </div>)}
      </div>
      {hasMid && <p style={{ color: 'var(--text)' }}>Pairs whose gap is at most {step.mid} are counted with a sliding left pointer over the sorted values.</p>}
    </>
  }} renderReasoning={({ run, step }) => <>
    <p>{step.message}</p>
    <p><strong>Monotone count:</strong> the number of pairs within distance d only grows with d, so the smallest d reaching k pairs is the answer.</p>
    <p>{run.input.nums.length} values, sorted first.</p>
  </>} />
}
