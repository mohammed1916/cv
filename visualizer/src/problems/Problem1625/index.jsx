import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin with s as the best string.' },
    { id: 'visit', label: 'Visit string', description: 'Take the next reachable string and compare it with the best.' },
    { id: 'done', label: 'Complete', description: 'Report the smallest reachable string.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Digits, a and b (JSON object with s, a, b)',
  url: 'https://leetcode.com/problems/lexicographically-smallest-string-after-applying-operations/',
  complexity: 'Number of reachable strings times n. The visualization caps s at 8 digits.',
  examples: [
    { label: 'Example 1', input: '{"s":"5525","a":9,"b":2}' },
    { label: 'Example 2', input: '{"s":"74","a":5,"b":1}' },
    { label: 'Example 3', input: '{"s":"0011","a":4,"b":2}' },
  ],
}

export default function LexicographicallySmallestAfterOperations() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Current string" length={run.input.s.length} valueAt={i => step.current[i] ?? ''} active={-1}
      roleAt={i => (i % 2 === 1 ? 'odd' : '')} />
    <output aria-label="Queue and best">{`Queue: ${step.queued}, best: ${step.best}`}</output>
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>Odd positions (counting from zero) take the add operation, and rotation moves the last b digits to the front. Every reachable string is visited once.</p>
  </>} />
}
