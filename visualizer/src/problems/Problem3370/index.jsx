import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin with the candidate 1.' },
    { id: 'grow', label: 'Grow', description: 'Append a set bit: candidate times 2 plus 1.' },
    { id: 'done', label: 'Complete', description: 'Report the first candidate at least n.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with n (1 to 1000), for example {"n":5}',
  url: 'https://leetcode.com/problems/smallest-number-with-all-set-bits/',
  complexity: 'O(log n) time and O(1) extra space.',
  examples: [
    { label: 'Example 1', input: '{"n":5}' },
    { label: 'Example 2', input: '{"n":10}' },
  ],
}

export default function SmallestAllSetBits() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <output aria-label="Candidate">{`Candidate ${step.candidate} in binary: ${step.candidate.toString(2)}`}</output>
  </>} renderReasoning={() => <>
    <p>A number with every bit set has the form 2^k - 1, so the candidates are 1, 3, 7, 15, and so on.</p>
    <p>The first candidate that is at least n is the answer, because no smaller all-ones number reaches n.</p>
  </>} />
}
