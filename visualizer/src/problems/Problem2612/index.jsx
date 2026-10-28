import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Place the single 1 at p with zero operations.' },
    { id: 'visit', label: 'Expand', description: 'Try each window of length k that contains the 1.' },
    { id: 'reach', label: 'Reach', description: 'Record a new position one operation further.' },
    { id: 'done', label: 'Answers', description: 'Return the count for every position.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with n, p, banned and k (JSON)',
  url: 'https://leetcode.com/problems/minimum-reverse-operations/',
  complexity: 'O(n * k) time for this visualization, which caps n at 12. Efficient solutions use sorted sets per parity.',
  examples: [
    { label: 'Example 1', input: '{"n":4,"p":0,"banned":[1,2],"k":4}' },
    { label: 'Window 1', input: '{"n":4,"p":2,"banned":[0,1,3],"k":1}' },
  ],
}

export default function ReverseOperations() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Operations to bring the 1 to each position (-1 = never)" length={run.input.n}
      valueAt={i => step.dist[i]} active={step.pos ?? -1}
      roleAt={i => (run.input.banned.includes(i) ? 'banned' : '')} />
    <output aria-label="Reverse state">{step.message}</output>
  </>} renderReasoning={() => <>
    <p>Only the position of the single 1 matters, so the search is over positions rather than whole arrays.</p>
    <p>Reversing the window that starts at s sends position i to s + (s + k - 1) - i, which gives the set of destinations for each i.</p>
    <p>Banned positions are never entered, and each position is reached at its shortest distance first.</p>
  </>} />
}
