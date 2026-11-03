import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import TwoBagGridView from './TwoBagGridView'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '3647',
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Object with items, w1 and w2 (e.g. {"items":[4,3,2],"w1":5,"w2":4})',
  url: 'https://leetcode.com/problems/maximum-weight-in-two-bags/',
  complexity: 'O(n × w1 × w2) time and O(w1 × w2) space for n items. The visualization caps there at 8 items, weights up to 9 and capacities up to 12; the official bounds are not verified here.',
  examples: [
    { label: 'Split across bags', input: '{"items":[4,3,2],"w1":5,"w2":4}' },
    { label: 'No room', input: '{"items":[1,2,3],"w1":0,"w2":0}' },
    { label: 'Both bags full', input: '{"items":[5,5,5],"w1":5,"w2":5}' },
  ],
}

export default function Problem3647Visualizer() {
  return <AlgorithmWorkspace
    definition={definition}
    renderVisual={({ run, step }) => <TwoBagGridView run={run} step={step} />}
    renderReasoning={({ step }) => <p>{step.message}</p>}
  />
}
