import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'distance', label: 'Distances', description: 'Measure how far each person is from person 3.' },
    { id: 'check', label: 'Compare', description: 'Compare the two distances.' },
    { id: 'done', label: 'Result', description: 'Report who arrives first.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with x, y and z (integers from 1 to 100)',
  url: 'https://leetcode.com/problems/find-closest-person/',
  complexity: 'O(1) time and O(1) space.',
  examples: [
    { label: 'Example 1', input: '{"x":2,"y":7,"z":4}' },
    { label: 'Example 2', input: '{"x":2,"y":5,"z":6}' },
    { label: 'Example 3', input: '{"x":1,"y":5,"z":3}' },
  ],
}

export default function FindClosestPerson() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <ol aria-label="Positions on a line">
      {[['Person 1', run.input.x, step.d1], ['Person 2', run.input.y, step.d2], ['Person 3', run.input.z, null]].map(([label, at, distance]) =>
        <li key={label} data-role={label}><strong>{label}</strong> at {at}{distance !== null && distance !== undefined ? `, distance ${distance}` : ''}</li>)}
    </ol>
    <output aria-label="Closest person">{step.phase === 'done' ? `answer ${step.result}` : 'comparing distances'}</output>
  </>} renderReasoning={() => <>
    <p>Both people walk toward person 3 at the same speed, so the one with the shorter distance arrives first. Equal distances mean they arrive together.</p>
    <p>Only the two absolute differences matter, so the answer takes constant time.</p>
  </>} />
}
