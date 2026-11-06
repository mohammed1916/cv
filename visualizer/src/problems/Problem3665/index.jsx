import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  number: '3665',
  phases: [
    { id: 'start', label: 'Start', description: 'One way reaches the top-left cell.' },
    { id: 'move', label: 'Move', description: 'A plain right or down move lands on an empty cell.' },
    { id: 'reflect', label: 'Reflect', description: 'The move meets a mirror and is turned.' },
    { id: 'blocked', label: 'Blocked', description: 'The move or reflection leaves the grid.' },
    { id: 'done', label: 'Result', description: 'Report the paths to the finish.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with grid (rows of 0 and 1, start and finish empty)',
  url: 'https://leetcode.com/problems/twisted-mirror-path-count/',
  complexity: 'One DP pass over the cells. Each reflection chain moves down or right, so it stays within m + n steps.',
  examples: [
    { label: 'Centre mirror', input: '{"grid":[[0,0,0],[0,1,0],[0,0,0]]}' },
    { label: 'Two rows', input: '{"grid":[[0,0],[1,0]]}' },
  ],
}

export default function TwistedMirrorPathCount() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <table className="algorithm-grid" aria-label="Mirror grid with path counts">
      <tbody>{run.input.grid.map((row, i) => <tr key={i}>{row.map((cell, j) => {
        const onPath = step.path.some(([r, c]) => r === i && c === j)
        const current = step.at[0] === i && step.at[1] === j
        return <td key={j} data-mirror={cell === 1} data-path={onPath} data-current={current}
          style={{ border: '1px solid currentColor', padding: '0.4rem 0.6rem', textAlign: 'center', background: cell === 1 ? 'var(--border)' : onPath ? 'var(--primary-glow)' : 'transparent', outline: current ? '2px solid currentColor' : 'none' }}>
          <small>{cell === 1 ? 'mirror' : 'empty'}</small><br /><strong>{step.ways[i][j]}</strong>
        </td>
      })}</tr>)}</tbody>
    </table>
    <output aria-label="Move check">{step.dir
      ? `${step.dir === 'R' ? 'Right' : 'Down'} from (${step.at[0]}, ${step.at[1]}): ${step.message}`
      : step.message}</output>
  </>} renderReasoning={() => <>
    <p>Only right and down moves are allowed, so each cell is final once every cell above and to the left has been processed.</p>
    <p>A move that meets a mirror is one move: the robot is turned and keeps stepping until it reaches an empty cell or leaves the grid. Each move adds its ways to the cell where it lands.</p>
  </>} />
}
