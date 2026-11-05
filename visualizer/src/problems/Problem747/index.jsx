import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'No values seen yet.' },
    { id: 'new-max', label: 'New largest', description: 'The old largest becomes the second largest.' },
    { id: 'new-second', label: 'New second', description: 'A value fits between the top two.' },
    { id: 'skip', label: 'Skip', description: 'The value is below the top two.' },
    { id: 'done', label: 'Complete', description: 'Compare the largest with twice the second.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'nums (JSON array of integers 0–100)',
  url: 'https://leetcode.com/problems/largest-number-at-least-twice-of-others/',
  complexity: 'O(n) time and O(1) extra space.',
  examples: [
    { label: 'Dominant', input: '[4,12,3,1]' },
    { label: 'Close', input: '[9,5,8]' },
    { label: 'Zeros', input: '[0,0,3]' },
  ],
}

export default function LargestAtLeastTwice() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="nums (largest and second largest marked)" length={run.input.length} active={step.i}
      valueAt={i => run.input[i]}
      roleAt={i => (i === step.best ? 'largest' : step.second !== null && run.input[i] === step.second && i <= step.i ? 'second' : '')} />
    <table aria-label="Top two"><tbody>
      <tr><th scope="row">Largest</th><td>{step.first === null || step.first === -Infinity ? '–' : step.first}</td></tr>
      <tr><th scope="row">Second</th><td>{step.second === null || step.second === -Infinity ? '–' : step.second}</td></tr>
    </tbody></table>
    <output aria-label="Step">{step.message}</output>
  </>} renderReasoning={() => <>
    <p>One pass tracks the two largest values. The largest value qualifies only when it is at least twice the second largest, since every other value is no larger than the second.</p>
  </>} />
}
