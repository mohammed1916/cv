import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import FollowView from './FollowView'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '2190',
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'JSON with nums and key, e.g. {"nums":[1,100,200,1,100],"key":1}',
  url: 'https://leetcode.com/problems/most-frequent-number-following-key-in-an-array/',
  complexity: 'O(n) time and O(n) space for the follower counts. The visualization caps the array at 14 values.',
  examples: [
    { label: 'Repeated follower', input: '{"nums":[1,100,200,1,100],"key":1}' },
    { label: 'Run of key', input: '{"nums":[2,2,2,2,3],"key":2}' },
    { label: 'Two followers', input: '{"nums":[1,2,3,1,3],"key":1}' },
  ],
}

export default function Problem2190Visualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <FollowView run={run} step={step} />}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  )
}
