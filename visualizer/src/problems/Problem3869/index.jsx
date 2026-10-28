import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'No number has been checked yet.' },
    { id: 'count', label: 'Fancy', description: 'This number is fancy, so count it.' },
    { id: 'skip', label: 'Not fancy', description: 'Neither its digits nor its digit sum is good.' },
    { id: 'done', label: 'Complete', description: 'Report the count.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Range (JSON object with l and r)',
  url: 'https://leetcode.com/problems/count-fancy-numbers-in-a-range/',
  complexity: 'O((r - l) * digits) for this teaching version. The Python solution uses digit DP for the full range up to 10^15.',
  examples: [
    { label: 'Example 1', input: '{"l":8,"r":10}' },
    { label: 'Digit sum', input: '{"l":12340,"r":12341}' },
    { label: 'Neither', input: '{"l":123456788,"r":123456788}' },
  ],
}

export default function CountFancyNumbers() {
  const values = run => Array.from({ length: run.input.r - run.input.l + 1 }, (_, i) => run.input.l + i)
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Range" length={values(run).length} valueAt={i => values(run)[i]} active={step.x === null ? -1 : step.x - run.input.l} />
    <output aria-label="Count">{`Fancy so far: ${step.count}${step.x === null ? '' : `, digit sum ${step.total}`}`}</output>
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>A good number has strictly monotone digits, and a single digit is always good. A number is fancy if it is good, or if its digit sum is good.</p>
  </>} />
}
