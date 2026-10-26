import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import PagedGrid from '../../components/shared/PagedGrid'
import { StackLane } from '../../components/shared/AlgorithmStatePrimitives'
import { buildTrace, parseInput, code } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Input', description: 'Explain the cell states.' },
    { id: 'scan', label: 'Find regions', description: 'Flood-fill infected regions and measure threatened cells and walls.' },
    { id: 'choose', label: 'Pick worst', description: 'Choose the region threatening the most healthy cells.' },
    { id: 'wall', label: 'Build walls', description: 'Quarantine the chosen region and add its wall count.' },
    { id: 'spread', label: 'Spread', description: 'All other regions infect their threatened cells.' },
    { id: 'done', label: 'Complete', description: 'Return the total number of walls.' },
  ],
  parse: parseInput, build: buildTrace, code,
  inputLabel: 'Grid isInfected (JSON)',
  url: 'https://leetcode.com/problems/contain-virus/',
  complexity: 'O((mn)^2) worst case: each day scans the whole grid and there are at most mn days. Capped at 20 x 20.',
  examples: [
    { label: 'Example 1', input: '[[0,1,0,0,0,0,0,1],[0,1,0,0,0,0,0,1],[0,0,0,0,0,0,0,1],[0,0,0,0,0,0,0,0]]' },
    { label: 'Example 2', input: '[[1,1,1],[1,0,1],[1,1,1]]' },
    { label: 'Example 3', input: '[[1,1,1,0,0,0,0,0,0],[1,0,1,0,1,1,1,1,1],[1,1,1,0,0,0,0,0,0]]' },
  ],
}
const COLORS = ['#94a3b8', '#dc2626', '#475569']
const NAMES = ['healthy', 'infected', 'contained']

export default function ContainVirus() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <PagedGrid label="Grid" rows={step.grid.length} columns={step.grid[0].length} cellAt={(r, c) => {
      const v = step.grid[r][c], id = step.regionOf ? step.regionOf[r][c] : -1
      const reg = id >= 0 ? step.regions[id] : null
      return { value: v, label: id >= 0 ? `region ${id}${id === step.chosen ? ' (quarantine)' : ''}` : NAMES[v], role: id === step.chosen && id >= 0 ? 'chosen' : '', color: id === step.chosen && id >= 0 ? '#f59e0b' : COLORS[v],
        detail: `${NAMES[v]}${reg ? `; region ${id}: ${reg.size} cells, threatens ${reg.threatened} cells, needs ${reg.walls} walls` : ''}` }
    }} />
    <StackLane title="Regions today (id: threatened / walls)" items={step.regions.map(r => `${r.id}: ${r.threatened}/${r.walls}`)} note={`day ${step.day}`} />
    <output aria-label="Total walls">Total walls built: {step.total}</output>
  </>} renderReasoning={() => <>
    <p>The simulation is exact: walls are counted per (infected, healthy) neighbouring pair of the chosen region, because a wall between two cells serves one infected cell. Two infected cells threatening the same healthy cell each need their own wall.</p>
  </>} />
}
