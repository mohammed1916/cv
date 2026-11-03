import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Check', description: 'Is the permutation already sorted?' },
    { id: 'try', label: 'Candidate k', description: 'Search the arrangements reachable with this k.' },
    { id: 'done', label: 'Result', description: 'Report the largest working k.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with nums (a permutation of 0 to n minus 1, up to 7 values)',
  url: 'https://leetcode.com/problems/maximum-k-to-sort-a-permutation/description/',
  complexity: 'Teaching search: up to n candidate values, each exploring at most n! arrangements. Not the efficient route for large n.',
  examples: [
    { label: 'Invented example', input: '{"nums":[2,0,1]}' },
    { label: 'Already sorted', input: '{"nums":[0,1]}' },
  ],
}

export default function MaximumKToSortAPermutation() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="arrangement" length={step.arrangement.length} valueAt={i => step.arrangement[i]} active={-1}
      roleAt={() => ''} />
    <output aria-label="Candidate check">{step.k === null ? 'no candidate yet' : `k = ${step.k}${step.ok === undefined ? '' : step.ok ? ' sorts' : ' is stuck'}`}</output>
  </>} renderReasoning={() => <>
    <p>A trade is allowed only when the bitwise AND of its pair is exactly k, so the answer is the largest k whose allowed trades can reach the sorted order.</p>
    <p>The visualization enumerates reachable arrangements by breadth-first search, which is exact but only practical for a few values.</p>
    <p>This teaching model is knowledge-derived and not verified against the official judge.</p>
  </>} />
}
