import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '155',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Operations (JSON array)',
  url: 'https://leetcode.com/problems/min-stack/',
  complexity: 'O(1) time for each operation and O(n) space for the stack of pairs.',
  examples: [
    { label: 'Classic', input: '[["push",-2],["push",0],["push",-3],["getMin"],["pop"],["top"],["getMin"]]' },
    { label: 'Pop the minimum', input: '[["push",5],["push",1],["push",3],["pop"],["getMin"],["pop"],["getMin"]]' },
    { label: 'Single value', input: '[["push",7],["top"],["getMin"]]' },
  ],
}

export default function MinStackDesign() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => {
    const { stack, op, name, result } = step.snapshot
    return <>
      <div aria-label="Stack" style={{ display: 'flex', flexDirection: 'column-reverse', gap: 4, width: 220, fontFamily: 'monospace' }}>
        {stack.length === 0 && <p>The stack is empty.</p>}
        {stack.map((slot, i) => <div key={i} style={{ display: 'flex', justifyContent: 'space-between', border: '1px solid var(--border)', padding: 6, background: i === stack.length - 1 ? 'var(--surface2)' : 'transparent' }}>
          <span>value {slot.value}</span><span>min {slot.low}</span>
        </div>)}
      </div>
      <p>{op !== null && op !== undefined && name ? `Operation ${op + 1}: ${name}${result !== undefined ? ` returned ${result}` : ''}` : 'Start'}</p>
    </>
  }} renderReasoning={() => <>
    <p><strong>Key idea:</strong> each slot stores the smallest value at or below it. Popping restores the minimum from the slot underneath, so getMin never scans.</p>
    <p>Every push, pop, top and getMin takes constant time.</p>
  </>} />
}
