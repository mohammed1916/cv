import withProblemStory from '../../components/shared/withProblemStory';
import storyGuide from './storyGuide.json';
import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, pythonLineMap, phases } from './algorithm'

const definition = {
  parse: parseInput, build: buildTrace, code, python, pythonLineMap, phases,
  inputLabel: '[rows, cols, centreRow, centreCol] (JSON)',
  url: 'https://leetcode.com/problems/matrix-cells-in-distance-order/',
  complexity: 'O(rows × cols) time and space: each cell is queued once.',
  examples: [
    { label: '3 × 3 centre', input: '[3,3,1,1]' },
    { label: '2 × 4 corner', input: '[2,4,0,0]' },
  ],
}

function CellsByDistance() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => {
    const s = step.snapshot
    const rank = new Map(s.order.map(([r, c], i) => [`${r},${c}`, i + 1]))
    const cur = s.current ? `${s.current[0]},${s.current[1]}` : null
    return <>
      <p>Distance from centre ({s.centre[0]}, {s.centre[1]}) is row offset plus column offset. Listed so far: {s.order.length} of {s.rows * s.cols}.</p>
      <div role="grid" aria-label="Matrix in distance order" style={{ display: 'grid', gridTemplateColumns: `repeat(${s.cols}, 56px)`, gap: 4 }}>
        {Array.from({ length: s.rows }, (_, r) => Array.from({ length: s.cols }, (_, c) => {
          const key = `${r},${c}`, n = rank.get(key)
          const centre = r === s.centre[0] && c === s.centre[1]
          return <div key={key} role="gridcell" data-cell={key} aria-current={key === cur ? 'step' : undefined}
            style={{ border: key === cur ? '2px solid var(--primary)' : '1px solid var(--border)', borderRadius: 6, padding: 4, textAlign: 'center', background: n ? 'var(--surface2)' : 'var(--surface)' }}>
            <small>{centre ? 'centre' : `d ${Math.abs(r - s.centre[0]) + Math.abs(c - s.centre[1])}`}</small>
            <div>{n ? `#${n}` : '·'}</div>
          </div>
        }))}
      </div>
    </>
  }} renderReasoning={() => <>
    <p>A breadth-first search from the centre reaches cells in rings of growing distance, so the order it pops cells in is already sorted by distance.</p>
    <p>Cells with equal distance may appear in any order, which is allowed for this problem.</p>
  </>} />
}

export default withProblemStory(CellsByDistance, storyGuide);
