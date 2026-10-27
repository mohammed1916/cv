import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Points', description: 'Sort the cuts and add the two ends.' },
    { id: 'length', label: 'Gap', description: 'Move to stretches spanning one more step.' },
    { id: 'try', label: 'Try cut', description: 'Try each cut inside the stretch as the first one made.' },
    { id: 'keep', label: 'Keep', description: 'Store the cheapest way to cut this stretch.' },
    { id: 'done', label: 'Complete', description: 'Report the minimum total cost.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with n (stick length) and cuts (positions, JSON)',
  url: 'https://leetcode.com/problems/minimum-cost-to-cut-a-stick/',
  complexity: 'O(m^3) time for m cut points including the ends. The visualization caps n at 20 and cuts at 6.',
  examples: [
    { label: 'Example 1', input: '{"n":7,"cuts":[1,3,4,5]}' },
    { label: 'Example 2', input: '{"n":9,"cuts":[5,6,1,4,2]}' },
  ],
}

export default function MinimumCostToCutStick() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => {
    const m = step.pts.length
    return <>
      <table aria-label="Best cost for each stretch">
        <thead><tr><th>from \ to</th>{step.pts.map((p, j) => <th key={j}>{p}</th>)}</tr></thead>
        <tbody>{step.best.map((row, i) => <tr key={i}><th>{step.pts[i]}</th>{row.map((v, j) => {
          const current = step.cell && step.cell[0] === i && step.cell[1] === j
          return <td key={j} data-role={current ? 'active' : undefined}>{j > i && j < m ? v : ''}</td>
        })}</tr>)}</tbody>
      </table>
      <output aria-label="Current cut">{step.apex === -1 ? 'No cut in use' : `Cut at ${step.pts[step.apex]} for stretch ${step.pts[step.cell[0]]} to ${step.pts[step.cell[1]]}`}</output>
    </>
  }} renderReasoning={() => <>
    <p>Each cut splits a stretch into two smaller stretches, and the cost of that cut is the length of the stretch being cut. The first cut made in a stretch decides the two sub-problems.</p>
    <p>Stretches are solved from short to long, so the best cost for each piece is ready before any larger stretch uses it.</p>
  </>} />
}
