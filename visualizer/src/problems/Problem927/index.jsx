import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Input', description: 'Read the binary array.' },
    { id: 'count', label: 'Count ones', description: 'Total ones decide whether an equal split is possible.' },
    { id: 'locate', label: 'Locate parts', description: 'Find the first one of each third and the tail length.' },
    { id: 'compare', label: 'Compare', description: 'The three parts agree at this offset.' },
    { id: 'mismatch', label: 'Mismatch', description: 'The parts differ; no split exists.' },
    { id: 'check', label: 'Check overlap', description: 'Make sure the three windows do not overlap.' },
    { id: 'done', label: 'Complete', description: 'Return the cut indices.' },
  ],
  parse: parseInput, build: buildTrace, code,
  inputLabel: 'Array arr of 0/1 (JSON)',
  url: 'https://leetcode.com/problems/three-equal-parts/',
  complexity: 'O(n) time and O(n) space for the index list. arr is capped at 100 values here.',
  examples: [
    { label: 'Example 1', input: '[1,0,1,0,1]' },
    { label: 'Example 2', input: '[1,1,0,1,1]' },
    { label: 'Example 3', input: '[1,1,0,0,1]' },
    { label: 'Leading zeros', input: '[0,1,0,0,1,0,0,1,0,0]' },
  ],
}

export default function ThreeEqualParts() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const [a, b, c] = step.starts ?? []
    const role = i => {
      if (step.t < 0 || a === undefined) return run.input[i] ? 'one' : ''
      for (const [w, s] of [['part1', a], ['part2', b], ['part3', c]]) if (i >= s && i <= s + step.t) return step.phase === 'mismatch' && i === s + step.t ? 'rejected' : w
      return ''
    }
    return <>
      <IndexedSequence label="arr (compared windows coloured)" length={run.input.length} active={-1} valueAt={i => run.input[i]} roleAt={role} />
      <output aria-label="Result">{step.phase === 'done' ? `Result: [${step.result.join(', ')}]` : step.ones === undefined ? '' : `Ones: ${step.ones}`}</output>
    </>
  }} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>Trailing zeros are part of the last number's value, so its length from the third group's first one to the end fixes how many digits the other two parts must match.</p>
  </>} />
}
