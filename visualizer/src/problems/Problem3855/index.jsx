import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'digits', label: 'Digits', description: 'Count the allowed digits and add them up.' },
    { id: 'ways', label: 'Ways', description: 'Each position has the same number of other combinations.' },
    { id: 'place', label: 'Place values', description: 'Each position contributes its place value.' },
    { id: 'done', label: 'Complete', description: 'Report the sum modulo 1000000007.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Digit range and length (JSON object with l, r, k)',
  url: 'https://leetcode.doocs.org/en/lc/3855',
  complexity: 'O(log k) time with modular exponentiation. The visualization caps k at 60.',
  examples: [
    { label: 'Digits two to six, k three', input: '{"l":2,"r":6,"k":3}' },
    { label: 'Leading zeros', input: '{"l":0,"r":1,"k":3}' },
    { label: 'Modulo', input: '{"l":5,"r":5,"k":10}' },
    { label: 'Single digit', input: '{"l":0,"r":0,"k":1}' },
    { label: 'Equal digit range', input: '{"l":4,"r":4,"k":1}' },
    { label: 'Full digit range, k at limit', input: '{"l":0,"r":9,"k":60}' },
    { label: 'Long run: digits 3 to 9', input: '{"l":3,"r":9,"k":60}' },
  ],
}

export default function SumKDigitNumbers() {
  const digits = run => Array.from({ length: run.input.r - run.input.l + 1 }, (_, i) => run.input.l + i)
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Allowed digits" length={digits(run).length} valueAt={i => digits(run)[i]} active={-1} />
    <output aria-label="Sum">{`k = ${run.input.k}, digit sum ${step.digitSum}, ways ${step.ways ?? '-'}, result ${step.result ?? 'pending'}`}</output>
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>Every position is equally likely to hold each allowed digit, so the total is the digit sum times the number of combinations times the place-value total.</p>
  </>} />
}
