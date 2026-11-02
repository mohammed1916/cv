import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Sort', description: 'Order the points by column, then by height descending.' },
    { id: 'row', label: 'Sweep', description: 'Alice stays put while later points are checked.' },
    { id: 'above', label: 'Above', description: 'This point is higher than Alice.' },
    { id: 'count', label: 'Count', description: 'No earlier point blocks this fence.' },
    { id: 'block', label: 'Blocked', description: 'An earlier point blocks this fence.' },
    { id: 'done', label: 'Result', description: 'Total valid pairs.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON array of 2 to 12 distinct points [x, y] with coordinates 0 to 50 in this trace',
  url: 'https://leetcode.com/problems/find-the-number-of-ways-to-place-people-ii/',
  complexity: 'O(n^2) after sorting: each Alice point sweeps the points after it once, keeping the highest blocker seen so far.',
  examples: [
    { label: 'Example 1', input: '[[1,1],[2,2],[3,3]]' },
    { label: 'Example 2', input: '[[6,2],[4,4],[2,6]]' },
  ],
}

export default function PlacePeopleII() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <output aria-label="Pair being checked">{step.a ? `Alice = (${step.a[0]}, ${step.a[1]})${step.b ? `, Bob = (${step.b[0]}, ${step.b[1]})` : ''}, highest blocker = ${step.topBlock === -Infinity ? 'none' : step.topBlock}` : 'no pair yet'}</output>
    <output aria-label="Valid pairs">{`valid pairs: ${step.count} of ${run.input.length} points`}</output>
  </>} renderReasoning={() => <>
    <p>Sorting by column means that when Bob is checked, every blocker that could sit inside Alice's fence has already been seen.</p>
    <p>Only the highest such blocker matters: Bob's height must be strictly above it to leave the fence empty.</p>
  </>} />
}
