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
    { label: 'Equal values, distance zero', input: '{"nums":[0,0],"k":1}' },
    { label: 'Ties at equal distance', input: '{"nums":[5,5,5],"k":3}' },
    { label: 'Largest values allowed', input: '{"nums":[0,1000],"k":1}' },
    { label: 'Long run: 200 values', input: '{"nums":[515,495,124,282,573,226,259,354,274,888,25,117,978,242,173,637,826,240,66,240,416,215,297,807,421,928,900,139,738,982,831,555,993,373,703,81,486,191,960,911,894,728,937,989,309,524,531,892,460,106,416,374,166,446,20,228,377,383,700,349,356,550,833,146,859,556,780,685,354,439,900,211,647,668,99,938,461,187,597,239,815,296,870,643,270,356,976,265,384,600,709,564,938,571,297,578,764,931,583,6,273,672,896,814,985,4,74,197,643,409,335,116,765,644,945,721,675,716,893,357,372,72,27,24,792,540,350,420,310,775,421,981,546,232,93,542,811,927,0,515,768,503,534,727,140,372,236,296,534,941,833,213,720,182,335,485,936,92,944,9,54,760,680,553,674,103,966,487,482,513,596,156,454,926,812,39,725,96,420,75,201,83,181,805,260,206,887,219,87,3,860,448,506,943,822,688,365,910,314,3],"k":500}' },
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
