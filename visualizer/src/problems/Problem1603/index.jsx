import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1603',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with slots and cars (JSON)',
  url: 'https://leetcode.com/problems/design-parking-system/',
  complexity: 'O(1) per request and O(1) space: three counters, one per car type.',
  examples: [
    { label: 'Mixed types', input: '{"slots":[2,1,1],"cars":[1,1,2,1,3,3,1,2]}' },
    { label: 'Empty big lot', input: '{"slots":[0,2,0],"cars":[1,3,2,1]}' },
    { label: 'Exact fill', input: '{"slots":[1,1,1],"cars":[3,2,1,1]}' },
    { label: "One big car, one slot", input: "{\"slots\":[1,0,0],\"cars\":[1]}" },
    { label: "No slots left", input: "{\"slots\":[0,0,0],\"cars\":[2,3]}" },
    { label: "Thirty cars, ten slots each", input: "{\"slots\":[10,10,10],\"cars\":[1,2,3,1,2,3,1,2,3,1,2,3,1,2,3,1,2,3,1,2,3,1,2,3,1,2,3,1,2,3]}" },
    { label: "Long run: 30 cars", input: "{\"slots\":[4,6,8],\"cars\":[2,1,3,2,1,2,3,3,2,2,2,3,1,3,2,1,3,1,1,2,2,1,3,1,2,1,2,1,3,2]}" },
  ],
}

const NAMES = ['', 'big', 'medium', 'small']

export default function ParkingSystem() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { left, type, verdict, answers } = step.snapshot
    return <>
      <div role="img" aria-label="Free slots per car type" style={{ display: 'flex', gap: 12 }}>
        {left.map((count, index) => <div key={index} data-type={index + 1} style={{
          minWidth: 90, padding: 8, textAlign: 'center', fontFamily: 'monospace', boxSizing: 'border-box',
          border: `${type === index + 1 ? 2 : 1}px solid ${type === index + 1 ? 'var(--text)' : 'var(--border)'}`,
          background: type === index + 1 && verdict === false ? 'color-mix(in srgb, var(--error) 25%, transparent)' : type === index + 1 && verdict ? 'color-mix(in srgb, var(--success) 25%, transparent)' : 'transparent',
          color: 'var(--text)',
        }}><div>{NAMES[index + 1]}</div><strong>{count}</strong><small> free</small></div>)}
      </div>
      <p>{type ? `Request type: ${NAMES[type]}` : 'No request is being checked.'}</p>
      <p>Answers so far: {answers.length ? answers.map(a => a ? 'true' : 'false').join(', ') : 'none'}</p>
      <p style={{ color: 'var(--text-muted)' }}>Each request only reads and changes the counter for its own type.</p>
    </>
  }} renderReasoning={({ step }) => <>
    <p><strong>Exact type only:</strong> a request is compared with the counter for its own type and no other.</p>
    <p><strong>Rejection changes nothing:</strong> a full type returns false and leaves all three counters as they were.</p>
  </>} />
}
