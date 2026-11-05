import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Whole range', description: 'The answer index can be anywhere.' },
    { id: 'right', label: 'Go right', description: 'The middle letter is not greater: search the right half.' },
    { id: 'keep', label: 'Keep left', description: 'The middle letter is greater: it is a candidate.' },
    { id: 'done', label: 'Complete', description: 'Return the letter at lo, wrapping if needed.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'letters and target (JSON object)',
  url: 'https://leetcode.com/problems/find-smallest-letter-greater-than-target/',
  complexity: 'O(log n) time and O(1) extra space.',
  examples: [
    { label: 'Middle', input: '{"letters":["c","f","j","m","q"],"target":"k"}' },
    { label: 'Wrap', input: '{"letters":["b","d","e"],"target":"f"}' },
    { label: 'Repeat', input: '{"letters":["a","a","c","c"],"target":"a"}' },
  ],
}

export default function NextGreatestLetter() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label={`Letters (target ${run.input.target})`} length={run.input.letters.length} active={step.mid ?? -1}
      valueAt={i => run.input.letters[i]}
      roleAt={i => (i === step.lo && i === step.hi - 1 ? 'lo, hi' : i === step.lo ? 'lo' : i === step.hi ? 'hi' : i === step.mid ? 'mid' : i > step.lo && i < step.hi ? 'range' : '')} />
    <p><strong>Range:</strong> lo = {step.lo}, hi = {step.hi}{step.mid !== null ? `, mid = ${step.mid}` : ''}</p>
    <output aria-label="Step">{step.message}</output>
  </>} renderReasoning={() => <>
    <p>The search interval is half-open: lo is the first index that could be the answer, and hi is one past the last candidate. Each test halves it.</p>
    <p>When no letter is greater, lo runs past the end and the answer wraps to the first letter.</p>
  </>} />
}
