import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Set the best variance to zero.' },
    { id: 'pair', label: 'Letter pair', description: 'Choose the letters counted +1 and -1.' },
    { id: 'scan', label: 'Scan', description: 'Update the open window for this character.' },
    { id: 'done', label: 'Complete', description: 'Report the largest variance.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object {"s": lowercase string, up to 20 letters}',
  url: 'https://leetcode.com/problems/substring-with-largest-variance/',
  complexity: 'O(26 * 26 * n) time. The visualization caps input at 20 letters.',
  examples: [
    { label: 'Example 1', input: '{"s": "aababbb"}' },
    { label: 'No variance', input: '{"s": "abcde"}' },
  ],
}

export default function SubstringWithLargestVariance() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const [a, b] = step.pair || []
    return <>
      <IndexedSequence label="Letters" length={run.input.s.length} valueAt={i => run.input.s[i]} active={step.index}
        roleAt={i => (a && run.input.s[i] === a ? 'a (+1)' : b && run.input.s[i] === b ? 'b (-1)' : '')} />
      <output aria-label="Variance">{step.pair ? `Pair a=${a}, b=${b}: opened ${step.opened}, paired ${step.paired}, best ${step.best}` : `Best variance so far: ${step.best}`}</output>
    </>
  }} renderReasoning={() => <>
    <p>The variance of a substring is its largest letter count minus its smallest. Fixing the pair a and b turns the question into the largest sum of +1 for a and -1 for b.</p>
    <p>The window must contain b, because a window without b is not a valid pair. The paired value tracks only windows that include b.</p>
  </>} />
}
