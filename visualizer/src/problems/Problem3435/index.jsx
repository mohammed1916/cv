import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Letters', description: 'Collect the letters that appear in the words.' },
    { id: 'length', label: 'Length', description: 'Try every string of the current length.' },
    { id: 'found', label: 'Contains', description: 'This string keeps every word as a subsequence.' },
    { id: 'done', label: 'Result', description: 'Report one entry per letter-count profile.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with words (distinct two-letter strings)',
  url: 'https://leetcode.com/problems/frequencies-of-shortest-supersequences/',
  complexity: 'Exhaustive search over strings of the shortest length: exponential in the number of letters, so the visualization caps the input at 4 words and 4 letters.',
  examples: [
    { label: 'Two swapped words', input: '{"words":["xy","yx"]}' },
    { label: 'Shared first letter', input: '{"words":["mm","mn"]}' },
  ],
}

export default function FrequenciesOfShortestSupersequences() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="words" length={run.input.words.length} valueAt={i => run.input.words[i]} active={-1} />
    <output aria-label="Candidate string">{`candidate = ${step.candidate || 'none yet'}`}</output>
    <output aria-label="Profiles found">{`profiles = ${run.result.length}`}</output>
  </>} renderReasoning={() => <>
    <p>A shortest common supersequence uses only letters from the words, and its length is found by trying lengths upward.</p>
    <p>Two supersequences with the same letter counts are permutations of each other, so only one count array is kept.</p>
  </>} />
}
