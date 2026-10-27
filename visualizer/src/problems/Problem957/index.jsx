import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Input', description: 'Initial cells and day budget.' },
    { id: 'step', label: 'Simulate day', description: 'Apply the neighbour rule once.' },
    { id: 'cycle', label: 'Cycle found', description: 'A seen state repeats; shrink the remaining days modulo the cycle.' },
    { id: 'done', label: 'Complete', description: 'Return the final state.' },
  ],
  parse: parseInput, build: buildTrace, code, python, inputLabel: 'Object {cells, n} (JSON)',
  url: 'https://leetcode.com/problems/prison-cells-after-n-days/',
  complexity: 'O(min(n, 2^6)) simulated days, since states repeat within at most 64 steps.',
  examples: [
    { label: 'Example 1', input: '{"cells":[0,1,0,1,1,0,0,1],"n":7}' },
    { label: 'Example 2', input: '{"cells":[1,0,0,1,0,0,1,0],"n":1000000000}' },
    { label: 'Zero days', input: '{"cells":[1,1,1,1,1,1,1,1],"n":0}' },
  ],
}

export default function PrisonCells() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <IndexedSequence label="Cells (1 = occupied)" length={8} valueAt={i => step.cells[i]} roleAt={i => step.cells[i] ? 'match' : ''} />
    <output aria-label="Day">Day {step.day}; target day {step.n}{step.cycle ? `; cycle length ${step.cycle}` : ''}</output>
  </>} renderReasoning={() => <>
    <p>The end cells become empty after one day and stay empty, leaving 6 interior cells and at most 64 possible states. The sequence of states is therefore eventually periodic.</p>
    <p>Recording the day of each state lets us detect the first repeat, compute its cycle, and replace the remaining days by the remainder modulo the cycle length.</p>
  </>} />
}
