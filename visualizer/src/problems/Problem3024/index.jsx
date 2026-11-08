import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Sort', description: 'Order the sides from shortest to longest.' },
    { id: 'check', label: 'Check', description: 'The two shorter sides must sum to more than the longest.' },
    { id: 'none', label: 'None', description: 'The sides cannot close a triangle.' },
    { id: 'result', label: 'Result', description: 'Name the triangle by its equal sides.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON array of three side lengths from 1 to 100',
  url: 'https://leetcode.com/problems/type-of-triangle/',
  complexity: 'O(1) time and space for three sides.',
  examples: [
    { label: 'Equilateral', input: '[6,6,6]' },
    { label: 'Scalene', input: '[5,7,9]' },
    { label: 'None', input: '[3,4,8]' },
    { label: "Smallest equilateral", input: '[1,1,1]' },
    { label: "Isosceles", input: '[2,2,3]' },
    { label: "Largest equilateral", input: '[100,100,100]' },
    { label: "Degenerate line", input: '[1,2,3]' },
  ],
}

export default function TypeOfTriangle() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="sorted sides" length={3} valueAt={i => step.sides[i]} active={-1} roleAt={() => 'window'} />
    <div className="algorithm-inequality" aria-label="Triangle inequality">
      <p>{`a + b = ${step.sides[0] + step.sides[1]} compared with the longest side c = ${step.sides[2]}`}</p>
      <div style={{ display: 'grid', gap: 6 }}>
        <div style={{ width: `${(step.sides[0] + step.sides[1]) / (step.sides[0] + step.sides[1] + step.sides[2]) * 100}%`, background: 'var(--primary)', color: 'var(--text)', padding: '2px 6px' }}>a + b</div>
        <div style={{ width: `${step.sides[2] / (step.sides[0] + step.sides[1] + step.sides[2]) * 100}%`, background: 'var(--surface2)', color: 'var(--text)', padding: '2px 6px' }}>c</div>
      </div>
    </div>
    <output aria-label="Triangle result">{step.result ? `result: ${step.result}` : 'checking the sides'}</output>
  </>} renderReasoning={() => <>
    <p>Sorting puts the longest side last. Three sides form a triangle only when the two shorter sides add up to more than the longest.</p>
    <p>After that check, equal sides decide the name: all three equal, exactly two equal, or none equal.</p>
  </>} />
}
