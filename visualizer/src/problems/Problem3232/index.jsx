import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'split', label: 'Sum categories', description: 'Total the single-digit and double-digit numbers separately.' },
    { id: 'compare', label: 'Compare', description: 'Alice takes the larger category, so a tie is her loss.' },
    { id: 'done', label: 'Complete', description: 'Report the result.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with nums (values 1 to 99), for example {"nums":[1,2,3,4,5,14]}',
  url: 'https://leetcode.com/problems/find-if-digit-game-can-be-won/',
  complexity: 'O(n) time and O(1) extra space.',
  examples: [
    { label: 'Example 1', input: '{"nums":[1,2,3,4,5,14]}' },
    { label: 'Example 2', input: '{"nums":[5,5,5,25]}' },
  ],
}

export default function DigitGame() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Numbers" length={run.input.nums.length} valueAt={i => run.input.nums[i]} roleAt={i => (run.input.nums[i] < 10 ? 'single' : 'double')} />
    <output aria-label="Sums">{`Single-digit sum: ${step.singles} · Double-digit sum: ${step.doubles}`}</output>
  </>} renderReasoning={() => <>
    <p>Alice must commit to one category, and Bob then has the other. Whichever category has the larger total is the one Alice should take, so she wins exactly when the two totals differ.</p>
  </>} />
}
