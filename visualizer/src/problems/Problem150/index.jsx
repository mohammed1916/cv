import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '150',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Tokens in postfix order (JSON array of strings)',
  url: 'https://leetcode.com/problems/evaluate-reverse-polish-notation/',
  complexity: 'O(n) time and O(n) space: each token is read once and the stack holds at most n values.',
  examples: [
    { label: 'Sample', input: '["2","1","+","3","*"]' },
    { label: 'Subtract then multiply', input: '["7","2","-","5","*"]' },
    { label: 'Truncate division', input: '["-7","2","/"]' },
  ],
}

export default function EvaluateRpn() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { stack, token, operands, value, index } = step.snapshot
    return <>
      <div role="img" aria-label="Tokens, current token highlighted" style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {run.input.map((t, i) => <span key={i} data-token={i} style={{ padding: '2px 8px', fontFamily: 'monospace',
          border: `${i === index ? 2 : 1}px solid ${i === index ? 'var(--primary)' : 'var(--border)'}`,
          color: i > index ? 'var(--text-muted)' : 'var(--text)', opacity: i > index ? 0.6 : 1 }}>{t}<div><small>{i}</small></div></span>)}
      </div>
      <p>Solid tokens are read; the outlined token is the one being handled.</p>
      <div aria-label="Stack" style={{ marginTop: 12, display: 'flex', flexDirection: 'column-reverse', gap: 4, minHeight: 40, width: 120 }}>
        {stack.length === 0 && <small>empty</small>}
        {stack.map((v, i) => <div key={i} style={{ padding: '4px 8px', fontFamily: 'monospace', textAlign: 'center',
          border: `${operands && i >= stack.length - 1 ? 2 : 1}px solid var(--border)`,
          background: value !== null && i === stack.length - 1 ? '#bbf7d0' : 'transparent', color: value !== null && i === stack.length - 1 ? '#1c1917' : undefined }}>{v}</div>)}
      </div>
      {operands && <p>{`${operands[0]} ${token} ${operands[1]} = ${value}`}</p>}
    </>
  }} renderReasoning={() => <>
    <p><strong>Stack discipline:</strong> a number waits until an operator needs it, and the most recent values are always the operands.</p>
    <p><strong>Order matters:</strong> the value popped first is the right operand, so subtraction and division use left minus right and left divided by right.</p>
  </>} />
}
