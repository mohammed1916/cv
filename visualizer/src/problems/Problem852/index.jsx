import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Whole array', description: 'The peak can be anywhere between lo and hi.' },
    { id: 'rise', label: 'Climbing', description: 'mid is still rising: move lo past it.' },
    { id: 'fall', label: 'Falling', description: 'mid is at or past the peak: move hi onto it.' },
    { id: 'done', label: 'Complete', description: 'lo and hi meet at the peak.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'arr (JSON array that rises then falls)',
  url: 'https://leetcode.com/problems/peak-index-in-a-mountain-array/',
  complexity: 'O(log n) time and O(1) extra space.',
  examples: [
    { label: 'Early peak', input: '[1,4,7,5,2]' },
    { label: 'Late peak', input: '[2,3,4,9,8,1]' },
  ],
}

export default function PeakIndex() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Mountain array (lo, mid and hi marked)" length={run.input.length} active={step.mid ?? step.lo}
      valueAt={i => run.input[i]}
      roleAt={i => (i === step.lo && i === step.hi ? 'lo = hi' : i === step.lo ? 'lo' : i === step.hi ? 'hi' : i === step.mid ? 'mid' : i > step.lo && i < step.hi ? 'range' : '')} />
    <p><strong>Search range:</strong> lo = {step.lo}, hi = {step.hi}{step.mid !== null ? `, mid = ${step.mid}` : ''}</p>
    <output aria-label="Step">{step.message}</output>
  </>} renderReasoning={() => <>
    <p>Comparing a value with its right neighbour tells which side of the peak mid is on. Each comparison halves the range that can contain the peak.</p>
  </>} />
}
