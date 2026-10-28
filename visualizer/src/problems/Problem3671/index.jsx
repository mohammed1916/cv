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
    { label: 'Example 1', input: '[1,2,3]' },
    { label: 'Example 2', input: '[4,6]' },
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
