import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { parseInput, buildTrace, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'create', label: 'Create', description: 'The closure stores the initial value.' },
    { id: 'update', label: 'Update', description: 'increment or decrement changes the shared value.' },
    { id: 'reset', label: 'Reset', description: 'reset restores the initial value.' },
    { id: 'done', label: 'Done', description: 'All calls have returned.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with init and ops (increment, decrement, reset)',
  url: 'https://leetcode.com/problems/counter-ii/',
  complexity: 'O(1) per call. The closure holds one number.',
  examples: [
    { label: 'Mixed calls', input: '{"init":3,"ops":["increment","decrement","reset","increment"]}' },
    { label: 'Only decrements', input: '{"init":-2,"ops":["decrement","decrement"]}' },
    { label: 'No calls', input: '{"init":0,"ops":[]}' },
    { label: 'Upper limit start 100', input: '{"init":100,"ops":["increment"]}' },
    { label: 'Lower limit start -100, then reset', input: '{"init":-100,"ops":["reset","decrement","increment"]}' },
    { label: 'Long run: 20 calls', input: '{"init":7,"ops":["reset","reset","decrement","increment","decrement","reset","decrement","increment","reset","increment","reset","reset","reset","decrement","increment","reset","reset","increment","decrement","reset"]}' },
  ],
}

export default function CounterII() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <div aria-label="Shared counter" style={{ fontSize: 48, fontWeight: 700, textAlign: 'center' }}>{step.value}</div>
    <p style={{ textAlign: 'center' }}>Start value {run.input.init}, shared by all three methods.</p>
    <ol aria-label="Returned values" style={{ display: 'flex', gap: 8, listStyle: 'none', padding: 0, justifyContent: 'center' }}>
      {step.results.map((value, index) => <li key={index} style={{ padding: '4px 10px', border: '1px solid currentColor', borderRadius: 6 }}>{value}</li>)}
    </ol>
  </>} renderReasoning={() => <>
    <p>The three methods are closures over the same local variable, so a change made by one is visible to the others.</p>
    <p>reset does not remember the history; it only restores the number captured when the counter was created.</p>
  </>} />
}
