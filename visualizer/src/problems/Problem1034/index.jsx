import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Read the value of the starting cell.' },
    { id: 'flood', label: 'Flood', description: 'Visit every cell connected to the start with the same value.' },
    { id: 'border', label: 'Recolor', description: 'A component cell on the edge or next to another value is a border cell.' },
    { id: 'done', label: 'Complete', description: 'Return the recolored grid.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with grid, row, col and color (JSON)',
  url: 'https://leetcode.com/problems/coloring-a-border/',
  complexity: 'O(R * C) time and space for a grid of R rows and C columns.',
  examples: [
    { label: 'Example 1', input: '{"grid":[[1,1],[1,2]],"row":0,"col":0,"color":3}' },
    { label: 'Example 2', input: '{"grid":[[1,2,2],[2,3,2]],"row":0,"col":1,"color":3}' },
  ],
}

export default function ColoringBorder() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const inComp = new Set(step.members.map(([r, c]) => `${r},${c}`))
    const border = new Set(step.borders.map(([r, c]) => `${r},${c}`))
    const cur = step.cell ? `${step.cell[0]},${step.cell[1]}` : null
    return <table aria-label="Grid state">
      <tbody>
        {run.input.grid.map((line, r) => <tr key={r}>
          {line.map((value, c) => {
            const key = `${r},${c}`
            const role = key === cur ? 'current' : border.has(key) ? 'border' : inComp.has(key) ? 'member' : ''
            return <td key={c} data-role={role || undefined} className={role ? `is-${role}` : ''}>{value}</td>
          })}
        </tr>)}
      </tbody>
    </table>
  }} renderReasoning={() => <>
    <p>The component is found by flood fill from the starting cell, following equal neighbours only.</p>
    <p>A cell is on the border when one of its four neighbours lies outside the grid or outside the component.</p>
  </>} />
}
