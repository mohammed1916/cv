import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import TriangleView from './TriangleView'
import { buildTrace, code, parseInput, phases, python } from './algorithm'

const definition = {
  number: '2647',
  phases,
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with n, the side length (1 to 12 here)',
  url: 'https://leetcode.com/problems/color-the-triangle-red/',
  complexity: 'Listing the seeds takes O(n²) time. The sweeps are shown only to prove the seeds work and cost at most O(n⁴). The official limit on n is 1000; the drawing caps n at 12.',
  examples: [
    { label: 'Side 6', input: '{"n":6}' },
    { label: 'Single cell', input: '{"n":1}' },
    { label: 'Side 9', input: '{"n":9}' },
  ],
}

export default function ColorTheTriangleRed() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <TriangleView run={run} step={step} />} renderReasoning={() => <>
    <p>The spreading rule never lets a cell with fewer than two neighbours fill in, so the apex and both bottom corners must be seeded. Upward cells on the bottom row have only two neighbours, which makes them expensive to reach and cheap to seed.</p>
    <p>Reading upward from the bottom row, the seeding repeats every four rows. A row of upward seeds fills its own row. A lone seed in the next row then spreads sideways, because every upward cell there already touches a red cell below. The next two rows work the same way, with the left-corner seed releasing the last gap.</p>
    <p>The sweeps then run the rule for real, so you can watch white cells reach a count of 2 and flip. The rule is a pattern, not a formula derived step by step: the test suite checks minimality by trying every smaller starting set for small sizes.</p>
  </>} />
}
