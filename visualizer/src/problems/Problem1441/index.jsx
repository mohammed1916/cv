import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, phases, code, python, pythonLineMap } from './algorithm'

const definition = {
  number: '1441',
  inputLabel: 'Object with target (increasing) and n',
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  pythonLineMap,
  examples: [
    { label: 'Gap', input: '{"target":[1,3],"n":3}' },
    { label: 'Full', input: '{"target":[1,2,3],"n":3}' },
    { label: 'Late', input: '{"target":[4,6],"n":6}' },
  ],
  complexity: 'Time O(n) · Space O(target length) for the kept stack.',
  url: 'https://leetcode.com/problems/build-an-array-with-stack-operations/',
}

const slot = (filled, active) => ({
  display: 'inline-block', minWidth: 34, margin: 2, padding: '4px 8px', borderRadius: 6, textAlign: 'center',
  border: active ? '2px solid #0891b2' : '1px solid currentColor',
  background: filled ? 'rgba(8,145,178,0.22)' : 'transparent',
})

function StreamVisual({ step }) {
  const { target, n, index, stack, next, ops, skipped } = step.snapshot
  const numbers = Array.from({ length: n }, (_, i) => i + 1)
  return <div style={{ padding: 8 }}>
    <h4>Stream of numbers 1 to {n}</h4>
    <div>{numbers.map(v => <span key={v} style={slot(target.includes(v), v === skipped || v === next)}>{v}</span>)}</div>
    <p>Blue = in the target · outlined = the stream's current number ({next <= n ? next : 'done'})</p>
    <h4>Kept stack</h4>
    <div>{stack.length ? stack.map(v => <span key={v} style={slot(true, false)}>{v}</span>) : <em>empty</em>}</div>
    <h4>Operations</h4>
    <div>{ops.length ? ops.map((op, i) => <span key={i} style={{ margin: 2 }}>{op}</span>) : <em>none yet</em>}</div>
    {index !== null && <p>Target index {index}</p>}
  </div>
}

export default function BuildArrayWithStack() {
  return <AlgorithmWorkspace definition={definition}
    renderVisual={({ step }) => <StreamVisual step={step} />}
    renderReasoning={() => <p>A value that the target skips is pushed and popped; a value the target needs is pushed and left in place.</p>} />
}
