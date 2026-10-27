import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Box', description: 'Find the square box that contains every circle.' },
    { id: 'point', label: 'Point', description: 'Test one lattice point against every circle.' },
    { id: 'done', label: 'Complete', description: 'Report the number of covered lattice points.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Circles (JSON object with circles as [x, y, r] entries)',
  url: 'https://leetcode.com/problems/count-lattice-points-inside-a-circle/',
  complexity: 'O(W * H * n) time for a box of W by H points and n circles. The visualization caps input at 6 circles.',
  examples: [
    { label: 'One circle', input: '{"circles":[[2,2,1]]}' },
    { label: 'Two circles', input: '{"circles":[[2,2,2],[3,4,1]]}' },
  ],
}

export default function LatticePoints() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { loX, hiX, loY, hiY } = run.box
    const rows = []
    for (let y = hiY; y >= loY; y--) rows.push(y)
    const cols = []
    for (let x = loX; x <= hiX; x++) cols.push(x)
    const cellClass = (x, y) => {
      if (step.flags === null) return ''
      const index = (y - loY) * (hiX - loX + 1) + (x - loX)
      if (index === step.index) return 'is-current'
      if (index > step.index || step.flags[index] === undefined) return ''
      return step.flags[index] ? 'is-inside' : 'is-outside'
    }
    return <>
      <table aria-label="Lattice grid" style={{ borderCollapse: 'collapse', fontSize: 11 }}>
        <tbody>{rows.map(y => <tr key={y}>
          <th scope="row">{y}</th>
          {cols.map(x => <td key={x} className={cellClass(x, y)}
            style={{ width: 22, height: 22, textAlign: 'center', border: '1px solid currentColor', opacity: cellClass(x, y) === '' ? 0.35 : 1, background: cellClass(x, y) === 'is-inside' ? '#86efac' : cellClass(x, y) === 'is-current' ? '#fde68a' : 'transparent' }}>
            {cellClass(x, y) === 'is-inside' ? '•' : ''}
          </td>)}
        </tr>)}</tbody>
      </table>
      <output aria-label="Status">{step.message}</output>
    </>
  }} renderReasoning={() => <>
    <p>Only integer points within a circle's radius of its centre count, and a point covered by several circles counts once.</p>
    <p>Scanning the box around all circles and testing each point against every circle is enough, because nothing outside the box can be covered.</p>
  </>} />
}
