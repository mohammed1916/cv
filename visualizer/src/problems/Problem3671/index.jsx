import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'No subsequence has been counted yet.' },
    { id: 'end', label: 'End at i', description: 'Count the strictly increasing subsequences that end here, keyed by GCD.' },
    { id: 'done', label: 'Complete', description: 'Report the weighted sum modulo 1000000007.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON array of 1 to 12 integers from 1 to 70000',
  url: 'https://leetcode.doocs.org/en/lc/3671/',
  complexity: 'Each index merges GCD states from earlier smaller indices. The visualization caps the input at 12 values.',
  examples: [
    { label: 'Middle-sized large value', input: '[3,70000,1]' },
    { label: 'Four equal values', input: '[2,2,2,2]' },
    { label: 'Single value', input: '[1]' },
    { label: 'Equal values', input: '[5,5,5]' },
    { label: 'Largest values', input: '[70000,70000,70000,70000,70000,70000,70000,70000,70000,70000,70000,70000]' },
    { label: 'Long run: 12 values', input: '[62376,29349,65766,452,20355,18458,9772,51897,17329,62825,36503,49523]' },
  ],
}

export default function SumBeautifulSubsequences() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="nums" length={run.input.length} valueAt={i => run.input[i]} active={step.index} />
    <output aria-label="Total">{`Running total: ${step.total}`}</output>
  </>} renderReasoning={() => <>
    <p>A subsequence's weight is its GCD. Only strictly increasing subsequences count, so each element extends only earlier smaller elements.</p>
    <p>For each ending element, the counts are grouped by GCD, since the number of distinct GCD values stays small.</p>
  </>} />
}
