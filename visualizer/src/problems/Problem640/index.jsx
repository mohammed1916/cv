import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import RecordStateTable from '../../components/shared/RecordStateTable'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'split', label: 'Split sides', description: 'Read each side as an x-coefficient and a constant.' },
    { id: 'move', label: 'Collect terms', description: 'Subtract the right side from the left: a·x = b.' },
    { id: 'done', label: 'Decide', description: 'Pick the answer from a and b.' },
  ],
  parse: parseInput, build: buildTrace, code, python, inputLabel: 'Equation (JSON string with one =)',
  url: 'https://leetcode.com/problems/solve-the-equation/',
  complexity: 'O(n) time for an equation of length n, with constant extra space.',
  examples: [
    { label: 'Unique root', input: '"2x+3=7"' },
    { label: 'Contradiction', input: '"x+1=x+4"' },
    { label: 'Identity', input: '"3x-2=3x-2"' },
    { label: 'Bare unknown', input: '"x=5"' },
    { label: 'Cancels on both sides', input: '"-x=-x"' },
    { label: 'Largest coefficient', input: '"1000000x=1000000"' },
    { label: 'Long run: 80 added ones', input: '"3x+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1=x+80"' },
  ],
}

export default function SolveEquation() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => {
    const row = (name, side) => ({ side: name, 'x coefficient': side.coefficient, constant: side.constant })
    const rows = [row('left', step.left), row('right', step.right)]
    if (step.a !== null) rows.push({ side: 'left − right', 'x coefficient': step.a, constant: step.b })
    return <>
      <RecordStateTable label="Sides as a·x + constant" columns={['side', 'x coefficient', 'constant']} rows={rows}
        activeRow={step.phase === 'split' ? 1 : step.phase === 'move' ? 2 : -1} />
      <output aria-label="Result">{step.phase === 'done' ? step.result : step.a === null ? 'Reading the sides' : `${step.a}x = ${step.b}`}</output>
    </>
  }} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p><strong>Three outcomes:</strong> a non-zero x-coefficient gives one root (b / a); a zero coefficient with a non-zero constant is a contradiction; both zero means every x works.</p>
  </>} />
}
