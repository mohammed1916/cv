import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import GapThresholdView from './GapThresholdView'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '3520',
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Object with nums and k',
  url: 'https://leetcode.com/problems/minimum-threshold-for-inversion-pairs-count/',
  complexity: 'O(n^2 log V) time for n values with value range V: the threshold is binary searched and each probe scans all pairs. O(1) extra space. The visualization caps nums at 8 values.',
  examples: [
    { label: 'Two thresholds', input: '{"nums":[5,1,4,2],"k":3}' },
    { label: 'Not enough pairs', input: '{"nums":[1,2,3],"k":1}' },
    { label: 'Wide gaps', input: '{"nums":[9,-6,3,0],"k":4}' },
    { label: 'Two values', input: '{"nums":[4,-4],"k":1}' },
    { label: 'Equal values', input: '{"nums":[3,3,3,3],"k":2}' },
    { label: 'Extreme values, largest k', input: '{"nums":[9,-9,9,-9,9,-9,9,-9],"k":28}' },
    { label: 'Long run: 8 items', input: '{"nums":[8,7,5,1,-8,5,5,4],"k":7}' },
  ],
}

export default function MinimumThresholdInversionPairsVisualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <GapThresholdView run={run} step={step} />}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  )
}
