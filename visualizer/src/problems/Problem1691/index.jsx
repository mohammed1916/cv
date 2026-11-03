import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1691',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Boxes as [length, width, height] (JSON array)',
  url: 'https://leetcode.com/problems/maximum-height-by-stacking-cuboids/',
  complexity: 'O(n^2) time after sorting the boxes, and O(n) extra space.',
  examples: [
    { label: 'Four boxes', input: '[[3,2,1],[2,4,5],[4,1,2],[6,3,3]]' },
    { label: 'Equal boxes', input: '[[2,2,2],[2,2,2]]' },
    { label: 'Single box', input: '[[7,3,9]]' },
  ],
}

export default function StackingCuboids() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => {
    const { ordered, best, current, from } = step.snapshot
    if (!ordered) return <p>Sorting the sides of each box.</p>
    return <table aria-label="Box stacks" style={{ borderCollapse: 'collapse', fontFamily: 'monospace' }}>
      <thead><tr><th>box</th><th>best stack</th><th>below</th></tr></thead>
      <tbody>{ordered.map((box, i) => <tr key={i} style={{ background: i === current ? 'var(--surface2)' : undefined }}>
        <td>{box.join(' x ')}</td><td>{best && best[i] !== undefined ? best[i] : '-'}</td><td>{from && from[i] >= 0 ? ordered[from[i]].join(' x ') : (best && best[i] !== undefined ? 'none' : '-')}</td>
      </tr>)}</tbody>
    </table>
  }} renderReasoning={({ step }) => <>
    <p><strong>Key idea:</strong> a box can sit on another only if, once both are sorted, every side fits. Boxes can be turned, so sorting each box removes the choice of orientation for that test.</p>
    <p><strong>Chain:</strong> {step.snapshot.chain ? step.snapshot.chain.map(b => b.join(' x ')).join(' then ') : 'the chain is built as the boxes are processed'}.</p>
  </>} />
}
