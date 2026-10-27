import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import DistanceMatrixView from '../../components/shared/DistanceMatrixView'
import MatrixGrid from '../../components/shared/MatrixGrid'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin at the top-left with no teleports used.' },
    { id: 'move', label: 'Right and down', description: 'Extend the cheapest arrivals inside the current teleport layer.' },
    { id: 'teleport', label: 'Teleport layer', description: 'Build the next layer from cheaper-or-equal cells at no cost.' },
    { id: 'done', label: 'Complete', description: 'Report the cheapest arrival within k teleports.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Grid and teleport limit {"grid", "k"} (JSON)',
  url: 'https://leetcode.com/problems/minimum-cost-path-with-teleportations/',
  complexity: 'O(k * (m n)^2) time in this layered form. The visualization caps the grid at 4 by 4 and k at 2.',
  examples: [
    { label: 'Teleport', input: '{"grid":[[1,9],[1,1]],"k":1}' },
    { label: 'No teleport', input: '{"grid":[[0,5,1],[2,2,2]],"k":0}' },
  ],
}

export default function TeleportPath() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const active = step.cell ? { row: step.cell[0], col: step.cell[1] } : null
    return <>
      <MatrixGrid matrix={run.input.grid} label="Grid values" activeCell={active} cellWidth={44} cellHeight={40} />
      <DistanceMatrixView label={step.layer >= 0 ? `Cheapest cost with ${step.layer} teleport(s) used` : 'Final layer'} matrix={step.matrix} activeCell={active} />
      <output aria-label="Best">{`Best so far: ${step.best === Infinity ? '∞' : step.best} (teleports allowed: ${run.input.k})`}</output>
    </>
  }} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>Each teleport layer is a copy of the grid. A teleport adds one to the count and costs nothing, so layers are processed in order and the cheapest arrival per layer is kept.</p>
  </>} />
}
