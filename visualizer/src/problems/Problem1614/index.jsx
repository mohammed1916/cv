import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1614',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Expression text',
  url: 'https://leetcode.com/problems/maximum-nesting-depth-of-the-parentheses/',
  complexity: 'O(n) time and O(1) space: one scan with a single depth counter.',
  examples: [
    { label: 'Nested product', input: '2*(3+(4-1)*(5))' },
    { label: 'Deep chain', input: '((((1))))+(2)' },
    { label: 'No groups', input: '12*3+4' },
  ],
}

export default function NestingDepth() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { expr, index, depth, best } = step.snapshot
    return <>
      <div role="img" aria-label="Expression characters" style={{ display: 'flex', gap: 3, flexWrap: 'wrap', fontFamily: 'monospace' }}>
        {[...expr].map((ch, i) => <span key={i} style={{
          padding: '4px 6px', border: `${i === index ? 2 : 1}px solid ${i === index ? 'var(--text)' : 'var(--border)'}`,
          background: i === index ? 'var(--surface2)' : 'transparent',
        }}>{ch}</span>)}
      </div>
      <p>Current depth: <strong>{depth}</strong> · Best depth so far: <strong>{best}</strong></p>
      <div aria-label="Depth bar" style={{ display: 'flex', gap: 4, alignItems: 'flex-end', height: 90 }}>
        {Array.from({ length: best }, (_, k) => <div key={k} style={{
          width: 28, height: (k + 1) * 24, background: k < depth ? '#bbf7d0' : 'var(--surface2)', border: '1px solid var(--border)',
        }} />)}
      </div>
    </>
  }} renderReasoning={() => <>
    <p><strong>Depth is a running count:</strong> an opening parenthesis adds one level and a closing parenthesis removes one.</p>
    <p><strong>Record the peak:</strong> only the largest value reached while scanning matters, so every opening updates the best value.</p>
  </>} />
}
