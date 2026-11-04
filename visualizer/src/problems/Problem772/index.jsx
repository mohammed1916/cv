import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Read', description: 'Scan the tokens left to right.' },
    { id: 'apply', label: 'Apply', description: 'Combine two values with an operator.' },
    { id: 'done', label: 'Complete', description: 'Report the value of the whole expression.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Expression (JSON string, no spaces)',
  url: 'https://leetcode.com/problems/basic-calculator-iii/',
  complexity: 'O(n) time and recursion depth proportional to nesting. The visualization caps input at 40 characters.',
  examples: [
    { label: 'Precedence', input: '"6-4/2"' },
    { label: 'Nested', input: '"2*(5+5*2)/3+(6/2+8)"' },
  ],
}

// Tokens as cells: read tokens are shaded, the token at the read position is outlined.
export default function BasicCalculatorIII() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const tokens = step.tokens || run.input.match(/\d+|[-+*/()]/g) || []
    const pos = step.pos ?? 0
    return <>
      <div role="img" aria-label="Tokens of the expression" style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
        {tokens.map((t, i) => <div key={i} data-token={i} style={{
          minWidth: 30, padding: '4px 6px', textAlign: 'center', fontFamily: 'monospace', boxSizing: 'border-box', color: 'var(--text)',
          border: `${i === pos ? 2 : 1}px solid ${i === pos ? 'var(--text)' : 'var(--border)'}`,
          background: i < pos ? 'var(--surface2)' : 'transparent',
        }}>{t}</div>)}
      </div>
      <p style={{ color: 'var(--text)' }}>
        Parentheses depth: {step.depth ?? 0}. Shaded tokens are already read; the outlined token is next.
      </p>
      <output aria-label="Operation" style={{ display: 'block', color: 'var(--text)' }}>{step.op === null || step.op === undefined ? step.message : `${step.a} ${step.op} ${step.b} = ${step.value}`}</output>
      {step.value !== null && step.op === null && <p style={{ color: 'var(--text)' }}>Result: <strong>{step.value}</strong></p>}
    </>
  }} renderReasoning={() => <>
    <p>The grammar has three levels: an expression is terms joined by + and -, a term is factors joined by * and /, and a factor is a number or a parenthesised expression.</p>
    <p>Each level is a function, so precedence follows from the call structure. Division truncates toward zero, as the problem requires.</p>
  </>} />
}
