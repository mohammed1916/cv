import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import HashMapView from '../../components/shared/HashMapView'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Empty map', description: 'No letter set has been seen yet.' },
    { id: 'word', label: 'Key and count', description: 'Look up the word’s letter set, add the matches, then count this word.' },
    { id: 'done', label: 'Pairs', description: 'Report the total number of similar pairs.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Words as JSON: {"words": [...]}',
  url: 'https://leetcode.com/problems/count-pairs-of-similar-strings/',
  complexity: 'O(n * L log L) time for n words of length L, and O(n) space. The visualization caps input at 12 words.',
  examples: [
    { label: 'Example 1', input: '{"words":["aba","aabb","abcd","bac","aabc"]}' },
    { label: 'Example 2', input: '{"words":["aabb","ab","ba"]}' },
  ],
}

export default function SimilarStrings() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Words" length={run.input.words.length} valueAt={i => run.input.words[i]} active={step.index ?? -1} />
    <HashMapView maps={step.maps} ops={step.ops} />
    <output aria-label="Pairs so far">{`Similar pairs so far: ${step.result}`}</output>
  </>} renderReasoning={() => <>
    <p>Only the set of distinct letters matters, so each word is reduced to a key. Words with the same key are similar.</p>
    <p>Counting earlier words with the same key gives each pair exactly once.</p>
  </>} />
}
