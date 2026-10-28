import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'No index has been scored yet.' },
    { id: 'index', label: 'Index', description: 'Score every final value for this index, paying one change for each neighbour that shares a factor.' },
    { id: 'done', label: 'Return', description: 'The best score over all indices and values is the answer.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON: {"nums": [...], "maxVal": m}',
  url: 'https://leetcode.com/problems/maximum-score-with-co-prime-element/',
  complexity: 'O(n^2 * maxVal) time with gcd checks, and O(1) extra space. The visualization caps the array at 4 entries.',
  examples: [
    { label: 'Example 1', input: '{"nums":[3,4,6],"maxVal":5}' },
    { label: 'Example 2', input: '{"nums":[1,2,3],"maxVal":4}' },
  ],
}

export default function MaxScoreCoPrime() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="nums" length={run.input.nums.length} valueAt={j => run.input.nums[j]} active={step.index} />
    <output aria-label="Best score">{`Best score so far: ${step.best ?? '-'}. ${step.message}`}</output>
  </>} renderReasoning={() => <>
    <p>Every other element that shares a factor with the chosen value must be changed, and changing it to 1 is always enough because 1 is co-prime with everything.</p>
    <p>So the score of an index and value is the value minus the count of blockers, and the best one wins.</p>
  </>} />
}
