import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { parseInput, buildTrace, code } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Wrap the value in a checker.' },
    { id: 'check', label: 'Check', description: 'Compare strictly and pass or throw.' },
    { id: 'done', label: 'Done', description: 'All checks ran.' },
  ],
  parse: parseInput, build: buildTrace, code,
  inputLabel: 'Object with value and checks ([method, expected] pairs)',
  url: 'https://leetcode.com/problems/to-be-or-not-to-be/',
  complexity: 'O(1) per check, using strict equality.',
  examples: [
    { label: 'Mixed checks', input: '{"value":5,"checks":[["toBe",5],["notToBe",5],["toBe",6]]}' },
    { label: 'Strings', input: '{"value":"a","checks":[["notToBe","b"]]}' },
    { label: 'Boolean value', input: '{"value":true,"checks":[["toBe",true],["notToBe",false]]}' },
    { label: 'No checks', input: '{"value":0,"checks":[]}' },
    { label: 'Equal string checks', input: '{"value":"x","checks":[["toBe","x"],["toBe","x"]]}' },
    { label: 'Long run: 8 checks', input: '{"value":3,"checks":[["notToBe",2],["toBe",3],["notToBe",3],["toBe",4],["notToBe",4],["toBe",2],["notToBe",2],["toBe",3]]}' },
  ],
}

export default function ToBeOrNotToBe() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <output aria-label="Checked value" style={{ display: 'block', fontSize: 28, fontWeight: 700 }}>{`expect(${JSON.stringify(run.input.value)})`}</output>
    <ul aria-label="Check results" style={{ listStyle: 'none', padding: 0 }}>
      {step.results.map((r, i) => <li key={i} style={{ padding: '3px 0' }}>{`${r.label}: ${r.pass}`}</li>)}
      {step.results.length === 0 && <li>No checks yet.</li>}
    </ul>
  </>} renderReasoning={() => <>
    <p>The comparison is strict, so 5 and "5" are different. A failing check throws, which is how a test runner notices the failure.</p>
  </>} />
}
