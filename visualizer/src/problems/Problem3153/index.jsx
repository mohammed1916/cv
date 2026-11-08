import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import FrequencyCountTable from '../../components/shared/FrequencyCountTable'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Digit count', description: 'Read how many digits each number has.' },
    { id: 'position', label: 'Column', description: 'Count the digits in one column.' },
    { id: 'add', label: 'Add pairs', description: 'Add the pairs whose digits differ in this column.' },
    { id: 'done', label: 'Complete', description: 'Report the sum.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with nums of equal digit length (JSON)',
  url: 'https://leetcode.com/problems/sum-of-digit-differences-of-all-pairs/',
  complexity: 'O(n * d) time for n numbers with d digits, plus constant space per column. The visualization caps input at 30 numbers.',
  examples: [
    { label: 'Three numbers', input: '{"nums":[13,23,12]}' },
    { label: 'All equal', input: '{"nums":[10,10,10,10]}' },
    { label: "Smallest pair, one digit", input: "{\"nums\":[3,9]}" },
    { label: "Largest allowed values", input: "{\"nums\":[999999999,999999998]}" },
    { label: "Long run: 30 numbers", input: "{\"nums\": [970, 591, 276, 909, 578, 767, 928, 649, 658, 439, 660, 877, 562, 631, 216, 205, 578, 543, 112, 249, 530, 503, 572, 673, 150, 383, 396, 353, 238, 199]}" },
  ],
}

export default function DigitDifferences() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { nums } = run.input
    const digits = String(nums[0]).length
    const column = step.position
    return <>
      <IndexedSequence label="Numbers" length={nums.length} valueAt={i => nums[i]} active={-1} />
      <FrequencyCountTable title={column >= 0 ? `Digits in column ${column} from the right` : 'Digits by column'} entries={step.counts} emptyText={`Each number has ${digits} digit(s).`} />
      <output aria-label="Running total">{`Total so far: ${step.total}${column >= 0 ? `, this column adds ${step.differ}` : ''}`}</output>
    </>
  }} renderReasoning={() => <>
    <p>A pair contributes one for every column where its digits differ, so columns can be summed separately.</p>
    <p>In one column, the pairs that agree are the pairs drawn from the same digit, so differing pairs equal all pairs minus those.</p>
  </>} />
}
