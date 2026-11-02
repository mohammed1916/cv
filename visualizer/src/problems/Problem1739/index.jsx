import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin with the boxes to place.' },
    { id: 'pyramid', label: 'Pyramid', description: 'Grow the full pyramid while it still fits.' },
    { id: 'leftover', label: 'Leftover', description: 'Boxes not used by the full pyramid.' },
    { id: 'extra', label: 'Extra floor', description: 'Add one more floor box for the leftovers.' },
    { id: 'done', label: 'Result', description: 'Report the fewest floor boxes.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Number of boxes n (1 to 1000000000)',
  url: 'https://leetcode.com/problems/building-boxes/',
  complexity: 'O(cbrt(n)) time for the pyramid search and O(sqrt(n)) for the leftover floor boxes, O(1) extra space.',
  examples: [
    { label: 'Example 1', input: '3' },
    { label: 'Example 2', input: '4' },
    { label: 'Example 3', input: '10' },
  ],
}

export default function BuildingBoxes() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <output aria-label="Box counts">{`n = ${run.input.n}, full pyramid height ${step.m}, floor boxes ${step.floor}, extra floor boxes ${step.extra}, boxes left ${step.remaining}`}</output>
  </>} renderReasoning={() => <>
    <p>A full pyramid of height m stacks m(m+1)(m+2)/6 boxes and needs m(m+1)/2 floor boxes. The largest such pyramid that fits is taken first.</p>
    <p>Any leftover boxes need extra floor boxes: the k-th extra floor box can support k more boxes, so the loop adds floor boxes until the leftovers are placed.</p>
  </>} />
}
