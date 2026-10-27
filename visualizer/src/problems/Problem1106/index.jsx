import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin reading at the first character.' },
    { id: 'leaf', label: 'Literal', description: 'A t or f is a value by itself.' },
    { id: 'combine', label: 'Combine', description: 'An operator combines the values of its operands.' },
    { id: 'done', label: 'Complete', description: 'Report the value of the whole expression.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with expression (JSON)',
  url: 'https://leetcode.com/problems/parsing-a-boolean-expression/',
  complexity: 'O(n) time and O(n) stack depth for n characters. The visualization caps input at 60 characters.',
  examples: [
    { label: 'Example 1', input: '{"expression":"!(f)"}' },
    { label: 'Nested', input: '{"expression":"|(&(t,f,t),!(t))"}' },
  ],
}

export default function ParseBooleanExpression() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Expression characters" length={run.input.expression.length} valueAt={i => run.input.expression[i]}
      active={step.at} roleAt={i => (i === step.at ? 'reading' : '')} />
    <output aria-label="Current value">{step.value === null ? 'No value yet' : `Value so far: ${step.value ? 'true' : 'false'}`}</output>
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>Each operator needs all of its operands evaluated first, so the recursion reads the operands inside the brackets before combining them.</p>
  </>} />
}
