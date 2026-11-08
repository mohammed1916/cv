import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import DisjointSetView from '../../components/shared/DisjointSetView'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Singletons', description: 'Each string starts in its own group.' },
    { id: 'merge', label: 'Merge', description: 'A similar pair joins two groups.' },
    { id: 'same', label: 'Already joined', description: 'The pair is similar, but its groups already match.' },
    { id: 'done', label: 'Complete', description: 'Count the groups left.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Strings (JSON array of anagrams of equal length)',
  url: 'https://leetcode.com/problems/similar-string-groups/',
  complexity: 'O(n^2 * L) time for n strings of length L, with union-find for the groups.',
  examples: [
    { label: 'One group', input: '["abc","acb","bac","cba"]' },
    { label: 'Swap chain', input: '["abcd","bacd","bcad","dbca"]' },
    { label: 'Single string', input: '["a"]' },
    { label: 'Equal strings share a group', input: '["ab","ba","ab"]' },
    { label: 'Twelve anagrams of six letters', input: '["abcdef","bcdefa","cdefab","defabc","efabcd","fabcde","abcdef","bcdefa","cdefab","defabc","efabcd","fabcde"]' },
    { label: 'Long run: 12 shuffled anagrams', input: '["caefdb","ecdabf","cfeadb","dbfeac","edcfab","ebcadf","cbafed","cafedb","edfbac","feacdb","deafcb","acfedb"]' },
  ],
}

export default function SimilarStringGroups() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <DisjointSetView parent={step.parent} size={step.size} labels={run.labels} />
    <output aria-label="Groups">{`Groups: ${step.groups}`}</output>
    <p role="status">{step.message}</p>
  </>} renderReasoning={() => <>
    <p>Two strings are similar when they are equal or when a single swap of two positions makes them equal. Similarity links strings into groups, and union-find keeps the group count.</p>
  </>} />
}
