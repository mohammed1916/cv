import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import XorPrefixView from './XorPrefixView'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '3632',
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Object with nums and k (e.g. {"nums":[1,2,3],"k":2})',
  url: 'https://leetcode.com/problems/subarrays-with-xor-at-least-k/',
  complexity: 'O(n²) time and O(n) space for n numbers, comparing every pair of prefixes. The visualization caps nums at 12 values from 0 to 15 and k at 31; the official bounds are not verified here.',
  examples: [
    { label: 'Small array', input: '{"nums":[1,2,3],"k":2}' },
    { label: 'Pair of large values', input: '{"nums":[8,4],"k":12}' },
    { label: 'Nothing reaches k', input: '{"nums":[1,2],"k":4}' },
  ],
}

export default function Problem3632Visualizer() {
  return <AlgorithmWorkspace
    definition={definition}
    renderVisual={({ run, step }) => <XorPrefixView run={run} step={step} />}
    renderReasoning={({ step }) => <p>{step.message}</p>}
  />
}
