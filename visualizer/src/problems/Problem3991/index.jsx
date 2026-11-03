import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import PrefixReversalView from './PrefixReversalView'
import { buildTrace, parseInput, code, python } from './algorithm'

const phases = [
  { id: 'start', label: 'Start', description: 'Begin from the given arrangement.' },
  { id: 'pop', label: 'Expand', description: 'Take the next arrangement from the queue.' },
  { id: 'new', label: 'New', description: 'A reversal reaches an unseen arrangement.' },
  { id: 'seen', label: 'Seen', description: 'This arrangement was already reached.' },
  { id: 'found', label: 'Found', description: 'The sorted arrangement is reached.' },
  { id: 'done', label: 'Result', description: 'Report the move count or -1.' },
]

const definition = {
  number: '3991',
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Object with nums (a permutation) and pre (allowed prefix lengths)',
  url: 'https://leetcode.com/problems/sort-array-using-prefix-reversals/',
  complexity: 'O(n! * |pre| * n) time and O(n!) space for a breadth-first search over arrangements. The visualization caps nums at 6 entries, so at most 720 arrangements are explored.',
  examples: [
    { label: 'Two swap', input: '{"nums":[1,0,2,3],"pre":[2,4]}' },
    { label: 'Two steps', input: '{"nums":[2,0,1],"pre":[2,3]}' },
    { label: 'Unreachable', input: '{"nums":[1,2,0],"pre":[2]}' },
  ],
}

export default function SortArrayUsingPrefixReversals() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <PrefixReversalView run={run} step={step} />}
      renderReasoning={({ run, step }) => (
        <p>
          {step.message} {run ? `Result: ${run.result}.` : ''}
        </p>
      )}
    />
  )
}
