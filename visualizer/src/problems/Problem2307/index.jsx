import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import RatioGroupsView from './RatioGroupsView'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '2307',
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Object with equations ([x, y, value] meaning x / y = value)',
  url: 'https://leetcode.com/problems/check-for-contradictions-in-equations/',
  complexity: 'O(E * alpha(V)) time with weighted union-find, for E equations over V variables. The visualization caps the input at 8 equations and integer ratios from 1 to 20 with exact arithmetic; the draft does not verify the official bounds or the tolerance the source uses for floating-point comparison.',
  examples: [
    { label: 'Consistent chain', input: '{"equations":[["a","b",2],["b","c",3],["a","c",6]]}' },
    { label: 'Contradiction', input: '{"equations":[["a","b",2],["b","c",3],["a","c",5]]}' },
    { label: 'Self ratio', input: '{"equations":[["a","a",2]]}' },
  ],
}

export default function Problem2307Visualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <RatioGroupsView run={run} step={step} />}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  )
}
