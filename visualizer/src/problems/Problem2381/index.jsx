import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Prepare a difference array over positions.' },
    { id: 'mark', label: 'Mark', description: 'Each shift changes its two endpoints only.' },
    { id: 'apply', label: 'Apply', description: 'A running net shift moves each letter.' },
    { id: 'done', label: 'Complete', description: 'Return the shifted string.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with s and shifts (JSON)',
  url: 'https://leetcode.com/problems/shifting-letters-ii/',
  complexity: 'O(n + m) time and O(n) space. The visualization caps input at 20 letters and 8 shifts.',
  examples: [
    { label: 'Own case 1', input: '{"s":"abc","shifts":[[0,2,1],[1,2,1],[0,1,0]]}' },
    { label: 'Own case 2', input: '{"s":"dztz","shifts":[[1,1,1],[0,0,0]]}' },
    { label: 'Single letter', input: '{"s":"a","shifts":[[0,0,1]]}' },
    { label: 'Forward and backward on same range', input: '{"s":"aaaa","shifts":[[0,3,1],[0,3,0]]}' },
    { label: 'Longest string, 8 shifts', input: '{"s":"zzzzzzzzzzzzzzzzzzzz","shifts":[[0,19,0],[0,19,1],[0,19,0],[0,19,1],[0,19,0],[0,19,1],[0,19,0],[0,19,1]]}' },
    { label: 'Long run: 20 letters, 8 shifts', input: '{"s":"dfdrbsbwjqteljuzuvsh","shifts":[[4,13,1],[5,15,1],[0,5,1],[15,17,0],[1,14,1],[7,9,1],[16,18,0],[2,6,1]]}' },
  ],
}

export default function ShiftingLetters() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Letters" length={run.input.s.length} valueAt={i => step.letters?.[i] ?? run.input.s[i]} roleAt={i => (step.nets && i < step.nets.length ? `net ${step.nets[i]}` : '')} active={step.index} />
  </>} renderReasoning={() => <>
    <p>A shift over a range only needs two marks in a difference array, so m shifts cost O(m) work rather than O(n m).</p>
    <p>The running sum at each position is the net shift that letter receives, wrapping around the alphabet.</p>
  </>} />
}
