import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { parseInput, buildTrace, code } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Describe the target path.' },
    { id: 'walk', label: 'Copy path', description: 'Copy each object on the path.' },
    { id: 'set', label: 'Set', description: 'Write the new value at the end.' },
    { id: 'done', label: 'Result', description: 'The new state is ready.' },
  ],
  parse: parseInput, build: buildTrace, code,
  inputLabel: 'Object with state, path (keys) and value',
  url: 'https://leetcode.com/problems/immutability-helper/',
  complexity: 'O(path length) copies. Every other branch is shared with the original.',
  examples: [
    { label: 'Nested set', input: '{"state":{"a":{"b":1,"c":2},"d":3},"path":["a","b"],"value":9}' },
    { label: 'Top level', input: '{"state":{"a":{"b":1},"d":3},"path":["d"],"value":"new"}' },
  ],
}

export default function ImmutabilityHelper() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <ul aria-label="Copied objects" style={{ listStyle: 'none', padding: 0 }}>
      {step.copies.length === 0 && <li>No copies yet.</li>}
      {step.copies.map((name, i) => <li key={i}>{`new copy: ${name}`}</li>)}
    </ul>
    <p>{`Original state is unchanged: ${JSON.stringify(run.input.state)}`}</p>
  </>} renderReasoning={() => <>
    <p>Only the objects on the path to the change are recreated. Everything else keeps its identity, so comparisons on unchanged branches still succeed.</p>
  </>} />
}
