import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Count', description: 'Count how often each value appears.' },
    { id: 'ones', label: 'Ones', description: 'Ones can be used in any odd number.' },
    { id: 'base', label: 'Base', description: 'Start a chain from this value.' },
    { id: 'climb', label: 'Climb', description: 'Square to the next level, which needs two copies below.' },
    { id: 'top', label: 'Top', description: 'The top value appears once, so the chain closes.' },
    { id: 'best', label: 'Best', description: 'Keep the longest chain.' },
    { id: 'done', label: 'Result', description: 'The largest subset size.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON array of 1 to 12 integers from 1 to 1000',
  url: 'https://leetcode.com/problems/find-the-maximum-number-of-elements-in-subset/',
  complexity: 'O(n) expected time with a hash map. Each chain climbs only while values keep appearing twice.',
  examples: [
    { label: 'Example 1', input: '[5,4,1,2,2]' },
    { label: 'Example 2', input: '[1,3,2,4]' },
  ],
}

export default function MaximumElementsInSubset() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="nums" length={run.input.length} valueAt={i => run.input[i]} active={-1}
      roleAt={i => (step.cur !== null && run.input[i] === step.base ? 'base' : step.cur !== null && run.input[i] === step.cur ? 'top' : '')} />
    <output aria-label="Chain state">{`base = ${step.base ?? 'none'}, current = ${step.cur ?? 'none'}, length = ${step.length ?? 'none'}, best = ${step.best}`}</output>
  </>} renderReasoning={() => <>
    <p>A valid subset arranges as x, x squared, x to the fourth, up to a top value, then back down. Every value below the top must appear at least twice.</p>
    <p>Ones are special because 1 squared is still 1, so any odd count of ones forms a valid subset.</p>
  </>} />
}
