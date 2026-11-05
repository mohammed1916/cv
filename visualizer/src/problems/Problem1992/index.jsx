import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1992',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Grid of 0 (forest) and 1 (farmland) as JSON rows',
  url: 'https://leetcode.com/problems/find-all-groups-of-farmland/',
  complexity: 'O(m * n) time for the scan; each group is walked once along its top row and left column.',
  examples: [
    { label: 'Two groups', input: '[[1,1,0],[0,0,1],[0,0,1]]' },
    { label: 'Long strip', input: '[[0,1,1,0],[0,1,1,0]]' },
    { label: 'Only forest', input: '[[0,0],[0,0]]' },
  ],
}

export default function FindAllGroupsOfFarmland() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => {
    const { land, cell, groups, group } = step.snapshot
    const inGroup = (r, c) => groups.some(([t, l, b, rr]) => r >= t && r <= b && c >= l && c <= rr)
    return <>
      <table aria-label="Land grid" style={{ borderCollapse: 'collapse', color: 'var(--text)' }}>
        <tbody>{land.map((row, r) => <tr key={r}>{row.map((v, c) => {
          const isCell = cell && cell[0] === r && cell[1] === c
          const done = inGroup(r, c)
          return <td key={c} style={{
            width: 28, height: 28, textAlign: 'center', fontFamily: 'monospace',
            border: `${isCell ? 2 : 1}px solid ${isCell ? 'var(--primary)' : 'var(--border)'}`,
            background: v === 1 ? (done ? 'var(--primary-glow)' : 'var(--surface2)') : 'transparent',
          }}>{v}</td>
        })}</tr>)}</tbody>
      </table>
      <p>Groups found: <strong>{groups.length}</strong>{group ? `; latest group [top ${group[0]}, left ${group[1]}, bottom ${group[2]}, right ${group[3]}]` : ''}.</p>
      <p>Each group is reported by its top-left and bottom-right corners, since groups are rectangles that do not touch.</p>
    </>
  }} renderReasoning={() => <p>Because groups are rectangles and never touch, the first farmland cell met in row-major order is always a top-left corner. The bottom-right corner is found by walking the top row and left column.</p>} />
}
