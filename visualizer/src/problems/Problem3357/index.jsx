import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'scan', label: 'Range', description: 'Find the known values to search between.' },
    { id: 'pair', label: 'Pair', description: 'Try a pair (x, y) and assign each gap.' },
    { id: 'best', label: 'Best', description: 'This pair beats every earlier pair.' },
    { id: 'done', label: 'Result', description: 'Report the smallest largest gap.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with nums (integers 1 to 20, or -1 for missing)',
  url: 'https://leetcode.com/problems/minimize-the-maximum-adjacent-element-difference/description/',
  complexity: 'Teaching model: every pair in the known range, each checked by a dynamic program over the positions. The visualization caps values at 20 and the length at 8.',
  examples: [
    { label: 'Mixed', input: '{"nums":[1,2,-1,10,8]}' },
    { label: 'All missing', input: '{"nums":[-1,-1,-1]}' },
    { label: 'Gap in middle', input: '{"nums":[-1,10,-1,8]}' },
  ],
}

export default function MinimizeMaxAdjacentDifference() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => {
    const assignment = step.assignment || step.nums
    return <>
      <div aria-label="Filled array" style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {step.nums.map((original, i) => {
          const filled = assignment[i]
          const gap = i > 0 ? Math.abs(assignment[i] - assignment[i - 1]) : null
          return <div key={i} data-missing={original === -1 ? 'yes' : 'no'} style={{ minWidth: 56, padding: '0.5rem', textAlign: 'center', borderRadius: 6, border: `2px solid ${original === -1 ? 'var(--primary)' : 'var(--border, #94a3b8)'}` }}>
            <strong>{filled}</strong>
            <small style={{ display: 'block' }}>{original === -1 ? 'was -1' : 'given'}</small>
            {gap !== null && <small style={{ display: 'block' }}>gap {gap}</small>}
          </div>
        })}
      </div>
      <p>{step.x !== null ? `Pair (${step.x}, ${step.y}) with largest gap ${step.cost}.` : 'Collecting the range of known values.'}</p>
      <output aria-label="Best so far">{step.best ? `Best so far: ${step.best.cost} using (${step.best.x}, ${step.best.y}).` : ''}</output>
    </>
  }} renderReasoning={() => <>
    <p>Each -1 may take either x or y, so the order of choices matters. A dynamic program over positions tracks the lowest largest gap reachable with each choice.</p>
    <p>Clamping x and y into the range of known values never makes the largest gap worse, so only pairs inside that range need checking.</p>
  </>} />
}
