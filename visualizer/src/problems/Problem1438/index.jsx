import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, phases, code, python, pythonLineMap } from './algorithm'

const definition = {
  number: '1438',
  inputLabel: 'Object with nums and limit',
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  pythonLineMap,
  examples: [
    { label: 'Spread', input: '{"nums":[4,2,5,3],"limit":4}' },
    { label: 'Spike', input: '{"nums":[10,1,2,9,3],"limit":2}' },
    { label: 'Equal runs', input: '{"nums":[7,7,8,8,8,7],"limit":0}' },
  ],
  complexity: 'Time O(n) · Space O(n) for the two queues.',
  url: 'https://leetcode.com/problems/longest-continuous-subarray-with-absolute-diff-less-than-or-equal-to-limit/',
}

const tile = (active, inWindow) => ({
  display: 'inline-flex', flexDirection: 'column', alignItems: 'center', minWidth: 38, margin: 2, padding: '4px 6px',
  borderRadius: 6, border: active ? '2px solid #0891b2' : '1px solid currentColor',
  background: inWindow ? 'rgba(8,145,178,0.2)' : 'transparent',
})

function WindowVisual({ step }) {
  const { nums, limit, right, left, maxQueue, minQueue, maxValue, minValue, best } = step.snapshot
  return <div style={{ padding: 8 }}>
    <h4>Array (window in blue)</h4>
    <div>{nums.map((x, i) => <span key={i} style={tile(i === right, right !== null && i >= left && i <= right)}>
      <strong>{x}</strong><small>{i}</small>
    </span>)}</div>
    <p>Limit {limit} · Max queue (indices): [{maxQueue.join(', ')}] · Min queue: [{minQueue.join(', ')}]</p>
    <p>{right !== null ? `Window max ${maxValue}, min ${minValue}, spread ${maxValue - minValue}.` : 'No window yet.'} Best length so far: {best}.</p>
  </div>
}

export default function LongestWithinAbsoluteLimit() {
  return <AlgorithmWorkspace definition={definition}
    renderVisual={({ step }) => <WindowVisual step={step} />}
    renderReasoning={() => <p>Each queue's front is the window's current extreme, so the spread can be read in constant time while the window slides.</p>} />
}
