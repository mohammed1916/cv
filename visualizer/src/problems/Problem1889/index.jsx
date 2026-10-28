import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'No supplier has been checked yet.' },
    { id: 'skip', label: 'Skip supplier', description: 'This supplier cannot fit the largest package.' },
    { id: 'box', label: 'Use box', description: 'Give the uncovered packages up to this box size to the box.' },
    { id: 'improve', label: 'New best', description: 'This supplier has the smallest total waste so far.' },
    { id: 'done', label: 'Complete', description: 'Report the minimum waste modulo 1e9+7, or -1.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object: {"packages": [...], "boxes": [[...], ...]}',
  url: 'https://leetcode.com/problems/minimum-space-wasted-from-packaging/',
  complexity: 'Sort packages once, then each box is one binary search over the packages. The visualization caps input at 6 packages and 3 suppliers.',
  examples: [
    { label: 'Example 1', input: '{"packages":[2,3,5],"boxes":[[4,8],[2,8]]}' },
    { label: 'Example 2', input: '{"packages":[3,5,8,10,11,12],"boxes":[[12],[11,9],[10,5,14]]}' },
  ],
}

export default function MinimumSpaceWasted() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Packages, smallest first" length={run.input.packages.length} valueAt={i => [...run.input.packages].sort((a, b) => a - b)[i]} />
    <output aria-label="Waste">{`Supplier ${step.supplier === null ? '-' : step.supplier + 1}; box ${step.box ?? '-'}; total ${step.total ?? '-'}; best ${step.best ?? '-'}`}</output>
  </>} renderReasoning={() => <>
    <p>Each package sits in the smallest box that fits it, and its waste is that box size minus its own size.</p>
    <p>Boxes are checked in order, so the packages up to each size form one contiguous block that prefix sums total in constant time.</p>
  </>} />
}
