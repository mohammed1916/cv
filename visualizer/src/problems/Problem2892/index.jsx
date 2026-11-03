import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import GroupRunView from './GroupRunView'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  phases,
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with nums (positive integers) and k, e.g. {"nums":[2,3,4],"k":12}',
  url: 'https://leetcode.com/problems/minimizing-array-after-replacing-pairs-with-their-product/',
  complexity: 'O(n) time and O(1) extra space: each value is visited once and only the open group product is kept. The visualization caps nums at 20 values up to 1000 with k up to 10^6; official bounds were not verified for this teaching version.',
  examples: [
    { label: 'Mixed run', input: '{"nums":[2,3,4,5,6],"k":30}' },
    { label: 'Large value stands alone', input: '{"nums":[9,1,8,7,1],"k":8}' },
    { label: 'All merge', input: '{"nums":[1,1,1,1],"k":1}' },
    { label: 'Equal values', input: '{"nums":[4,4,4,4,4,4],"k":16}' },
    { label: 'Several splits', input: '{"nums":[5,2,3,1,6,2,7],"k":12}' },
  ],
}

export default function MinimizingArrayAfterReplacingPairs() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <GroupRunView run={run} step={step} />}
      renderReasoning={({ run, step }) => (
        <p>
          {step.message} {run ? `Final length: ${run.result}.` : ''}
        </p>
      )}
    />
  )
}
