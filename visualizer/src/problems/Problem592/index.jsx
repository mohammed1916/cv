import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Zero', description: 'Begin at 0/1.' },
    { id: 'add', label: 'Add term', description: 'Cross-multiply, then reduce by the gcd.' },
    { id: 'done', label: 'Complete', description: 'Return the reduced fraction.' },
  ],
  parse: parseInput, build: buildTrace, code, inputLabel: 'Expression (JSON string)',
  url: 'https://leetcode.com/problems/fraction-addition-and-subtraction/',
  complexity: 'O(k log D) time for k fractions with denominators up to D, and O(1) extra space.',
  examples: [
    { label: 'Two halves', input: '"-1/2+1/2"' },
    { label: 'Thirds', input: '"-1/2+1/2+1/3"' },
    { label: 'Mixed', input: '"1/3-1/2"' },
    { label: 'Whole result', input: '"5/3+1/3"' },
  ],
}

export default function FractionAddition() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <output aria-label="Running fraction" style={{ fontSize: '1.4rem' }}>{step.num}/{step.den}</output>
    <div className="algorithm-sequence">
      <h3>Terms</h3>
      <div className="algorithm-sequence__cells">{run.input.map((term, i) => <div key={i} className={`algorithm-sequence__cell ${step.term === term ? 'is-active' : ''}`}>
        <small>term {i + 1}</small><strong>{term.n}/{term.d}</strong></div>)}</div>
    </div>
  </>} renderReasoning={({ run, step }) => <>
    <p>{step.message}</p>
    <p><strong>Cross-multiplication:</strong> a/b + c/d = (ad + cb)/(bd). Reducing after every term keeps the numbers small.</p>
    <p>{run.input.length} terms are combined in order; the result is {run.result ?? 'not yet computed'}.</p>
  </>} />
}
