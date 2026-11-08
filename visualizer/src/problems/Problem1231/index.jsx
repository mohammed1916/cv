import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import BarCutView from './BarCutView'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1231',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with sweetness (nonnegative integers) and k',
  url: 'https://leetcode.com/problems/divide-chocolate/description/',
  complexity: 'O(n log S) time and O(1) extra space, where S is the total sweetness. The visualization caps the bar count at 12 and accepts only nonnegative integers, because the greedy check relies on that; the draft does not state an exact official bound.',
  examples: [
    { label: 'Nine bars', input: '{"sweetness":[1,2,3,4,5,6,7,8,9],"k":5}' },
    { label: 'Four bars', input: '{"sweetness":[5,6,7,8],"k":2}' },
    { label: 'No cuts', input: '{"sweetness":[4,1],"k":0}' },
    { label: 'Single bar, no cuts', input: '{\"sweetness\":[7],\"k\":0}' },
    { label: 'Equal bars', input: '{\"sweetness\":[3,3,3,3],\"k\":1}' },
    { label: 'Large sweetness values', input: '{\"sweetness\":[1000000,1,1000000],\"k\":1}' },
    { label: 'Long run: twelve bars, eleven cuts', input: '{\"sweetness\":[36,47,35,12,41,3,48,22,37,16,17,38],\"k\":11}' },
  ],
}

export default function Problem1231DivideChocolate() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <BarCutView run={run} step={step} />}
      renderReasoning={() => (
        <p>Each probe asks whether every piece can reach the candidate minimum. A greedy scan closes a piece as soon as it reaches the candidate, so counting closed pieces decides the probe; the search keeps the largest candidate that passes.</p>
      )}
    />
  )
}
