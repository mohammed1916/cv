import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import WindowMarkView from './WindowMarkView'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '2200',
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'JSON with nums, key and k, e.g. {"nums":[3,4,9,1,3,9,5],"key":9,"k":1}',
  url: 'https://leetcode.com/problems/find-all-k-distant-indices-in-an-array/',
  complexity: 'O(n * k) time in this window walk, or O(n) with a sweep. The page caps the length at 14 and values at 9.',
  examples: [
    { label: 'Two keys', input: '{"nums":[3,4,9,1,3,9,5],"key":9,"k":1}' },
    { label: 'All equal', input: '{"nums":[2,2,2,2,2],"key":2,"k":0}' },
    { label: 'Edge key', input: '{"nums":[1,0,0,0,0],"key":1,"k":1}' },
    { label: 'Single value key', input: '{"nums":[5],"key":5,"k":0}' },
    { label: 'Repeated key', input: '{"nums":[4,4,4,4],"key":4,"k":2}' },
    { label: 'Long run: 14 values', input: '{"nums":[3,1,4,1,5,9,2,6,5,3,5,8,9,7],"key":5,"k":7}' },
  ],
}

export default function Problem2200Visualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <WindowMarkView run={run} step={step} />}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  )
}
