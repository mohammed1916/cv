import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Grid', description: 'Read the land cells.' },
    { id: 'count', label: 'Islands', description: 'Count the islands with a flood fill.' },
    { id: 'dfs', label: 'DFS', description: 'Visit land cells and record discovery and low times.' },
    { id: 'done', label: 'Answer', description: 'Report the number of days.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON grid of 0 (water) and 1 (land) rows',
  url: 'https://leetcode.com/problems/minimum-number-of-days-to-disconnect-island/',
  complexity: 'O(R * C) time and space for the grid. The visualization caps the grid at 6 by 6.',
  examples: [
    { label: 'Two by two', input: '[[1,1],[1,1]]' },
    { label: 'Cut cell', input: '[[1,1,0],[0,1,0],[0,1,1]]' },
  ],
}

export default function DisconnectIsland() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const cuts = new Set(step.cuts)
    const current = step.cell ? `${step.cell[0]},${step.cell[1]}` : null
    return <>
      <table className="algorithm-grid" aria-label="Grid cells">
        <tbody>{run.input.map((row, r) => <tr key={r}>{row.map((value, c) => {
          const k = `${r},${c}`
          return <td key={c} data-land={value} data-current={k === current ? 'true' : undefined} data-cut={cuts.has(k) ? 'true' : undefined}
            style={{ background: value ? 'var(--accent-soft, #d1fae5)' : 'transparent', border: '1px solid currentColor', width: 34, height: 34, textAlign: 'center', outline: k === current ? '3px solid #f59e0b' : 'none' }}>
            {cuts.has(k) ? 'cut' : value ? 'L' : ''}
          </td>
        })}</tr>)}</tbody>
      </table>
      <output aria-label="Cut cells">{`Cut cells found: ${step.cuts.length}`}</output>
    </>
  }} renderReasoning={() => <>
    <p>A cell whose removal splits the island is a cut point. A DFS tree finds them: a child that cannot reach above its parent makes the parent a cut point.</p>
    <p>If the island has no cut point and more than one cell, two removals always work, so the answer is 2.</p>
  </>} />
}
