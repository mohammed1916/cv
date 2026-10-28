import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import MatrixGrid from '../../components/shared/MatrixGrid'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Set the best total to zero before scanning.' },
    { id: 'patch', label: 'Patch', description: 'Collect every water cell connected to a start cell.' },
    { id: 'done', label: 'Complete', description: 'Report the richest patch.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object with a grid of fish counts (0 is land)',
  url: 'https://leetcode.com/problems/maximum-number-of-fish-in-a-grid/',
  complexity: 'O(mn) time and space for the flood fill. The visualization caps the grid at 7 by 7.',
  examples: [
    { label: 'Example 1', input: '{"grid":[[0,2,1,0],[4,0,0,3],[1,0,0,4],[0,3,2,0]]}' },
    { label: 'Diagonal', input: '{"grid":[[5,0],[0,7]]}' },
  ],
}

export default function MaxFish() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <MatrixGrid label="Fish grid" matrix={run.input.grid} highlightedCells={step.members} />
    <output aria-label="Patch total">{`Patch total: ${step.total}, best: ${step.best}`}</output>
  </>} renderReasoning={() => <>
    <p>Two water cells belong to the same patch when a chain of side-adjacent water cells joins them. A fisher who starts anywhere in a patch can collect all of its fish.</p>
    <p>The answer is the largest total over all patches, or zero when there is no water.</p>
  </>} />
}
