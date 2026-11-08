import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1673',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with values and k (JSON)',
  url: 'https://leetcode.com/problems/find-the-most-competitive-subsequence/',
  complexity: 'O(n) time and O(n) space: every value is pushed and popped at most once.',
  examples: [
    { label: 'Sample A', input: '{"values":[4,1,5,2],"k":2}' },
    { label: 'Pops', input: '{"values":[9,8,1,7],"k":2}' },
    { label: 'Whole array', input: '{"values":[4,2,9],"k":3}' },
    { label: 'One value', input: '{"values":[7],"k":1}' },
    { label: 'Equal values', input: '{"values":[2,2,2],"k":2}' },
    { label: 'Largest k', input: '{"values":[5,1,9,3,7,0,1000,2],"k":8}' },
    { label: 'Long run: 40 values', input: '{"values":[26,419,376,850,855,625,276,158,682,707,65,151,984,322,276,340,803,642,36,501,49,337,807,377,821,16,74,661,861,140,585,284,184,7,167,710,949,261,566,781],"k":10}' },
  ],
}

export default function MostCompetitive() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { index, value, stack = [], k, popped, pushed } = step.snapshot
    return <>
      <div role="img" aria-label="Input values" style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {run.input.values.map((v, i) => <div key={i} style={{
          minWidth: 44, padding: '6px 8px', boxSizing: 'border-box', textAlign: 'center', fontFamily: 'monospace',
          border: `${i === index ? 2 : 1}px solid ${i === index ? 'var(--text)' : 'var(--border)'}`,
          opacity: i < (index ?? -1) ? 0.5 : 1,
        }}><div>{v}</div><small>{i}</small></div>)}
      </div>
      <p>Reading: {value ?? '-'}{popped !== undefined ? ` · popped ${popped}` : ''}{pushed === false ? ' · skipped' : ''}</p>
      <p aria-label="Stack">Stack ({stack.length} of {k}): [{stack.join(', ')}]</p>
    </>
  }} renderReasoning={() => <>
    <p><strong>Keep small values late:</strong> a larger value sitting on top of the stack is replaced by a smaller newcomer, as long as enough values remain to still fill k places.</p>
    <p><strong>Room check:</strong> the length test stops popping when removing another value would leave too few values to reach length k.</p>
  </>} />
}
