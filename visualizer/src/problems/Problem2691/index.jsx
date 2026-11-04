import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { parseInput, buildTrace, code, python, phases } from './algorithm'

const definition = {
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with obj and writes, a list of [path, value] assignments (e.g. {"obj":{"x":1},"writes":[[["x"],2]]})',
  url: 'https://leetcode.com/problems/immutability-helper/',
  complexity: 'O(path length) copies for each assignment. Every other branch is shared with the original, and the original is never changed.',
  examples: [
    { label: 'Nested set', input: '{"obj":{"a":{"b":1,"c":2},"d":3},"writes":[[["a","b"],9]]}' },
    { label: 'Two writes', input: '{"obj":{"x":5,"a":{"b":[1,2]}},"writes":[[["x"],6],[["a","b",1],9]]}' },
  ],
}

export default function ImmutabilityHelper() {
  return <AlgorithmWorkspace
    definition={definition}
    renderVisual={({ run, step }) => <>
      <ul aria-label="Copied objects" style={{ listStyle: 'none', padding: 0 }}>
        {step.copies.length === 0 && <li>No copies yet.</li>}
        {step.copies.map((name, i) => <li key={i}>{`new copy: ${name}`}</li>)}
      </ul>
      <p>{`Original object: ${JSON.stringify(run.input.obj)}`}</p>
      <p>{`Current result: ${JSON.stringify(step.phase === 'start' ? run.input.obj : run.result)}`}</p>
    </>}
    renderReasoning={({ step }) => <p>{step.message} Only the objects on the path to each change are copied; the rest of the structure is shared.</p>}
  />
}
