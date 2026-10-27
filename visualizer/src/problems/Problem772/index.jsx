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

export default function BasicCalculatorIII() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <output aria-label="Operation">{step.op === null ? step.message : `${step.a} ${step.op} ${step.b} = ${step.value}`}</output>
    {step.value !== null && step.op === null && <p>Result: <strong>{step.value}</strong></p>}
  </>} renderReasoning={() => <>
    <p>The grammar has three levels: an expression is terms joined by + and -, a term is factors joined by * and /, and a factor is a number or a parenthesised expression.</p>
    <p>Each level is a function, so precedence follows from the call structure. Division truncates toward zero, as the problem requires.</p>
  </>} />
}
