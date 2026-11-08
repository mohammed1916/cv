import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'
import CounterView from './CounterView'

const definition = {
  number: '2620',
  phases: [
    { id: 'start', label: 'Start', description: 'Store the starting number.' },
    { id: 'call', label: 'Call', description: 'Return the current value.' },
    { id: 'advance', label: 'Advance', description: 'Add one for the next call.' },
    { id: 'done', label: 'Result', description: 'All answers recorded.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object with init (integer) and calls (how many calls to make)',
  url: 'https://leetcode.com/problems/counter/',
  complexity: 'O(k) time for k calls and O(k) space for the recorded answers.',
  examples: [
    { label: 'Positive', input: '{"init":7,"calls":4}' },
    { label: 'Negative', input: '{"init":-5,"calls":3}' },
    { label: 'Zero start with one call', input: '{"init":0,"calls":1}' },
    { label: 'Lowest start at the call limit', input: '{"init":-20,"calls":10}' },
    { label: 'Highest start at the call limit', input: '{"init":20,"calls":10}' },
    { label: 'Long run: ten calls', input: '{"init":-13,"calls":10}' },
  ],
}

export default function Counter() {
  return <AlgorithmWorkspace definition={definition}
    renderVisual={({ step }) => <CounterView view={step.view} />}
    renderReasoning={() => <>
      <p>The closure keeps one variable alive between calls. Each call reads it before changing it.</p>
      <p>Returning the old value and then incrementing gives n, n+1, n+2, and so on.</p>
    </>} />
}
