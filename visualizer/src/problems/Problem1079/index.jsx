import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Count the tiles of each letter.' },
    { id: 'use', label: 'Use tile', description: 'Extend the current sequence with one available tile.' },
    { id: 'back', label: 'Put back', description: 'Return the tile and try the next letter.' },
    { id: 'done', label: 'Complete', description: 'Report the number of non-empty sequences.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with an uppercase string tiles (JSON)',
  url: 'https://leetcode.com/problems/letter-tile-possibilities/',
  complexity: 'Exponential in the number of tiles in the worst case. The visualization caps tiles at 7.',
  examples: [
    { label: 'Example 1', input: '{"tiles":"AAB"}' },
    { label: 'Example 2', input: '{"tiles":"AAABBC"}' },
  ],
}

export default function TilePossibilities() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <IndexedSequence label="Current sequence" length={step.word.length} active={step.word.length - 1}
      valueAt={index => step.word[index]} roleAt={() => 'built'} />
    <output aria-label="Sequences counted">{`Sequence: "${step.word || 'empty'}" · count ${step.total}`}</output>
  </>} renderReasoning={() => <>
    <p>Each step appends one tile of a letter that is still available, and every such extension is a distinct non-empty sequence.</p>
    <p>Backtracking restores the tile so the other letters can be tried at the same position.</p>
  </>} />
}
