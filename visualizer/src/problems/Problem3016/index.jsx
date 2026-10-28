import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'count', label: 'Count', description: 'Count how often each letter appears.' },
    { id: 'sort', label: 'Rank', description: 'Sort the letters by frequency.' },
    { id: 'assign', label: 'Assign', description: 'Charge each letter its presses for its rank.' },
    { id: 'done', label: 'Complete', description: 'Report the minimum pushes.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Lowercase word of 1 to 30 letters (JSON string)',
  url: 'https://leetcode.com/problems/minimum-number-of-pushes-to-type-word-ii/',
  complexity: 'O(n + k log k) where k is the number of distinct letters. The visualization caps input at 30 letters.',
  examples: [
    { label: 'Example 1', input: '"abcde"' },
    { label: 'Example 2', input: '"xyzxyzxyzxyz"' },
  ],
}

export default function PushesToType() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <IndexedSequence label="Letters by frequency" length={step.ranked.length}
      valueAt={i => `${step.ranked[i].letter}:${step.ranked[i].freq}`}
      active={step.rank} roleAt={i => `key ${Math.floor(i / 8) + 1}`} />
    <output aria-label="Pushes so far">{`Total pushes so far: ${step.total}`}</output>
  </>} renderReasoning={() => <>
    <p>A letter typed on the first press of its key costs one push per occurrence, so the most frequent letters belong in first positions.</p>
    <p>Eight keys each have a first position, so ranks 0 to 7 cost one press, ranks 8 to 15 cost two, and so on.</p>
  </>} />
}
