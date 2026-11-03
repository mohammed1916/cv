import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { meta } from './meta'
import { buildTrace, parseInput, code, python, phases, examples, complexity, inputLabel } from './algorithm'

const definition = {
  number: meta.number,
  phases, parse: parseInput, build: buildTrace, code, python, inputLabel, complexity, examples,
  url: `https://leetcode.com/problems/${meta.slug}/`,
}

function GridView({ snapshot }) {
  const { grid, corner, size } = snapshot
  return <table aria-label="Grid of zeros and ones" style={{ borderCollapse: 'collapse' }}><tbody>
    {grid.map((row, i) => <tr key={i}>{row.map((cell, j) => {
      const inside = corner && size && i >= corner[0] && i < corner[0] + size && j >= corner[1] && j < corner[1] + size
      const border = inside && (i === corner[0] || i === corner[0] + size - 1 || j === corner[1] || j === corner[1] + size - 1)
      return <td key={j} style={{
        width: 28, height: 28, textAlign: 'center', border: '1px solid #94a3b8',
        background: border ? '#0891b2' : inside ? '#a5f3fc' : cell ? '#e2e8f0' : 'transparent',
      }}>{cell}</td>
    })}</tr>)}
  </tbody></table>
}

export default function LargestBorderedSquareVisual() {
  return <AlgorithmWorkspace definition={definition}
    renderVisual={({ step }) => <>
      <GridView snapshot={step.snapshot} />
      <output aria-label="Best side">Best side so far: {step.snapshot.best ?? 0}</output>
    </>}
    renderReasoning={() => <p>Run lengths let each candidate square be checked in constant time: its top and left edges come from the corner's runs, and only its bottom and right edges need confirming.</p>} />
}
