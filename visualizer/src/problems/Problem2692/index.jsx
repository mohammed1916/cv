import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { parseInput, buildTrace, code, python, phases } from './algorithm'

const definition = {
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with obj, path (keys), action ("set" or "call") and method for calls',
  url: 'https://leetcode.com/problems/make-object-immutable/',
  complexity: 'O(n) to wrap every nested object and array once. Each refused attempt does one lookup along its path.',
  examples: [
    { label: 'Set a key in a nested object', input: '{"obj":{"a":1,"b":{"c":2}},"path":["b","c"],"action":"set"}' },
    { label: 'Index write into an array', input: '{"obj":{"list":[1,2]},"path":["list",0],"action":"set"}' },
    { label: 'Mutating method call', input: '{"obj":{"list":[1,2]},"path":["list"],"action":"call","method":"push"}' },
    { label: 'Read-only method call', input: '{"obj":{"list":[1,2]},"path":["list"],"action":"call","method":"map"}' },
    { label: 'Set a top-level key', input: '{"obj":{"n":1},"path":["n"],"action":"set"}' },
    { label: 'Call sort on an array', input: '{"obj":{"list":[3,1,2]},"path":["list"],"action":"call","method":"sort"}' },
    { label: 'Call push on a nested array', input: '{"obj":{"a":{"list":[]}},"path":["a","list"],"action":"call","method":"push"}' },
    { label: 'Long run: four keys into an array', input: '{"obj":{"a":{"b":{"c":[{"d":1}]}}},"path":["a","b","c",0],"action":"set"}' },
  ],
}

export default function MakeObjectImmutable() {
  return <AlgorithmWorkspace
    definition={definition}
    renderVisual={({ step }) => <>
      <ul aria-label="Wrapped objects" style={{ listStyle: 'none', padding: 0 }}>
        {step.frozen.map((name, i) => <li key={i} style={{ padding: '2px 0' }}>{`wrapped: ${name}`}</li>)}
        {step.frozen.length === 0 && <li>Nothing wrapped yet.</li>}
      </ul>
      {step.target && <output aria-label="Attempt">{`${step.target}: ${step.blocked ? `refused with "${step.error}"` : 'allowed'}`}</output>}
    </>}
    renderReasoning={({ step }) => <p>{step.message}</p>}
  />
}
