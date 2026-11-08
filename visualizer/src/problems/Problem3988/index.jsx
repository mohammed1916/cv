import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import KPathsGridView from './KPathsGridView'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with m, n and k',
  url: 'https://leetcode.com/problems/create-grid-with-exactly-k-paths-i/',
  complexity: 'O(m n) time and space to carve the grid and count its routes.',
  examples: [
    { label: 'Strip of three', input: '{"m":4,"n":5,"k":3}' },
    { label: 'Two diamonds', input: '{"m":5,"n":4,"k":4}' },
    { label: 'Tall and narrow', input: '{"m":5,"n":2,"k":4}' },
    { label: 'One route', input: '{"m":3,"n":6,"k":1}' },
    { label: 'Impossible', input: '{"m":1,"n":6,"k":3}' },
    { label: "Single cell", input: '{"m":1,"n":1,"k":1}' },
    { label: "Square tie", input: '{"m":4,"n":4,"k":2}' },
    { label: "Largest grid", input: '{"m":10,"n":10,"k":4}' },
    { label: "Long run: 10 by 9 grid", input: '{"m":10,"n":9,"k":3}' },
  ],
}

export default function CreateGridWithExactlyKPathsI() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <KPathsGridView run={run} step={step} />} renderReasoning={() => <>
    <p>Blocking a cell can only remove routes, so a free grid sets the ceiling. It holds one route for each way to arrange the downward steps among all the moves. If k is above that number, no grid exists.</p>
    <p>Two building blocks reach every k up to 4 below the ceiling. Routes add when a strip offers k separate places to step across, and they multiply when two diamonds sit in a row, so 2 × 2 gives 4 in a grid too short for a strip of 4.</p>
    <p>Everything else stays blocked so no extra route sneaks in. Counting routes cell by cell then confirms the construction: each free cell adds what arrives from above and from the left.</p>
  </>} />
}
