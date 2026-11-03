import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { parseInput, buildTrace, code } from './algorithm'

const definition = {
  phases: [
    { id: 'init', label: 'Start', description: 'Set the first two state values.' },
    { id: 'yield', label: 'Yield', description: 'Hand the current value to the caller.' },
    { id: 'advance', label: 'Advance', description: 'Shift the pair forward.' },
    { id: 'done', label: 'Done', description: 'No more values are produced.' },
  ],
  parse: parseInput, build: buildTrace, code,
  inputLabel: 'Object with count (0 to 15)',
  url: 'https://leetcode.com/problems/generate-fibonacci-sequence/',
  complexity: 'O(count) time and O(1) state. Only the last two values are kept.',
  examples: [
    { label: 'Six values', input: '{"count":6}' },
    { label: 'Ten values', input: '{"count":10}' },
  ],
}

export default function GenerateFibonacciSequence() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <ol aria-label="Yielded values" style={{ display: 'flex', gap: 8, flexWrap: 'wrap', listStyle: 'none', padding: 0 }}>
      {step.yielded.map((value, index) => <li key={index} style={{ padding: '4px 10px', border: '1px solid currentColor', borderRadius: 6, fontWeight: index === step.yielded.length - 1 ? 700 : 400 }}>{value}</li>)}
    </ol>
    <output aria-label="Pair state">{`a = ${step.a}, b = ${step.b}`}</output>
  </>} renderReasoning={() => <>
    <p>A generator keeps its local variables between calls. Two values are enough to produce the next term, so the state never grows.</p>
    <p>Each yield pauses the function; the next request resumes right after it.</p>
  </>} />
}
