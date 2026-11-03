import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { parseInput, buildTrace, code } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin at the outer object.' },
    { id: 'freeze', label: 'Freeze', description: 'Freeze children before parents.' },
    { id: 'write', label: 'Write', description: 'Attempt a change inside the structure.' },
    { id: 'done', label: 'Result', description: 'Every level refuses writes.' },
  ],
  parse: parseInput, build: buildTrace, code,
  inputLabel: 'Object with obj and write (a path of keys)',
  url: 'https://leetcode.com/problems/make-object-immutable/',
  complexity: 'O(n) over all nested objects and arrays, visited once each.',
  examples: [
    { label: 'Nested', input: '{"obj":{"a":1,"b":{"c":[1,2]}},"write":["b","c"]}' },
    { label: 'Flat', input: '{"obj":{"x":1,"y":2},"write":["x"]}' },
  ],
}

export default function MakeObjectImmutable() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <ul aria-label="Frozen objects" style={{ listStyle: 'none', padding: 0 }}>
      {step.frozen.map((name, i) => <li key={i} style={{ padding: '2px 0' }}>{`frozen: ${name}`}</li>)}
      {step.frozen.length === 0 && <li>Nothing frozen yet.</li>}
    </ul>
    {step.target && <output aria-label="Write attempt">{`write to ${step.target}: ${step.blocked ? 'rejected' : 'allowed'}`}</output>}
  </>} renderReasoning={() => <>
    <p>Freezing a parent alone would not stop writes into a child object, so the children must be frozen first.</p>
    <p>The walk visits each nested object once, which makes the cost proportional to the size of the structure.</p>
  </>} />
}
