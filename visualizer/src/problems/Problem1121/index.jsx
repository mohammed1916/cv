import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import DealLanesView from './DealLanesView'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1121',
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Object with nums (nondecreasing) and k (e.g. {"nums":[1,2,2,3,3,4],"k":3})',
  url: 'https://leetcode.com/problems/divide-array-into-increasing-sequences/',
  complexity: 'O(n) time and O(n) space for n values, counting equal values with a hash map. The visualization caps the input at 16 values, values from 0 to 1000 and k up to 16; the official bounds were not verified.',
  examples: [
    { label: 'Possible', input: '{"nums":[2,3,5,7,8,9,11,12],"k":2}' },
    { label: 'Impossible', input: '{"nums":[1,1,1,2,3],"k":2}' },
    { label: 'Single value', input: '{"nums":[4],"k":1}' },
    { label: 'Equal values form one run', input: '{"nums":[2,2,2],"k":3}' },
    { label: 'Largest k fills the list', input: '{"nums":[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16],"k":16}' },
    { label: 'Long run: 16 values, k = 3', input: '{"nums":[2,2,2,3,5,6,7,8,9,11,13,13,13,13,13,15],"k":3}' },
  ],
}

export default function DivideIntoIncreasingSequences() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <DealLanesView run={run} step={step} />}
      renderReasoning={({ run, step }) => (
        <p>
          Equal values cannot share a sequence, so the largest group f sets how many sequences are needed, and each needs k values.
          Dealing the sorted values round-robin keeps every sequence strictly increasing.
          {run ? ` The answer is ${String(run.answer)}.` : ''} {step.phase === 'check' ? 'The size test is the whole decision.' : ''}
        </p>
      )}
    />
  )
}
