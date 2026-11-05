import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  number: '2235',
  phases: [
    { id: 'setup', label: 'Read', description: 'Read the two integers.' },
    { id: 'done', label: 'Sum', description: 'Return their sum.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON {"num1": 7, "num2": -3}',
  url: 'https://leetcode.com/problems/add-two-integers/',
  complexity: 'O(1) time and O(1) space.',
  examples: [
    { label: 'Positive', input: '{"num1":7,"num2":-3}' },
    { label: 'Mixed signs', input: '{"num1":-8,"num2":3}' },
  ],
}

export default function AddTwoIntegers() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <output aria-label="Addition">{`${run.input.num1} + ${run.input.num2}${step.sum === null ? '' : ` = ${step.sum}`}`}</output>
    <p role="status">{step.message}</p>
  </>} renderReasoning={() => <>
    <p>Addition of two signed integers is direct: the result is their sum, with a negative operand moving the total below zero.</p>
  </>} />
}
