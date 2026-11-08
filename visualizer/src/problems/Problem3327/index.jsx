import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Root', description: 'Begin the visit at node 0.' },
    { id: 'node', label: 'Finish node', description: 'Build the node string after its children.' },
    { id: 'done', label: 'Complete', description: 'Report the palindrome answer for every node.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Tree (JSON object with parent and s)',
  url: 'https://leetcode.com/problems/check-if-dfs-strings-are-palindromes/',
  complexity: 'O(n^2) time in this trace, since each node string is rebuilt. The visualization caps input at 10 nodes.',
  examples: [
    { label: 'Example 1', input: '{"parent":[-1,0,0,1,1,2],"s":"aababa"}' },
    { label: 'Example 2', input: '{"parent":[-1,0,0,0,0],"s":"aabcb"}' },
    { label: 'Single node', input: '{"parent":[-1],"s":"a"}' },
    { label: 'Equal letters', input: '{"parent":[-1,0,0],"s":"aaa"}' },
    { label: 'Longest chain, 10 nodes', input: '{"parent":[-1,0,1,2,3,4,5,6,7,8],"s":"abcdeabcde"}' },
    { label: 'Long run: 10 nodes', input: '{"parent":[-1,0,0,1,3,4,5,2,5,7],"s":"acbbaaaaab"}' },
  ],
}

export default function DfsPalindromes() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Node letters" length={run.input.s.length} valueAt={i => run.input.s[i]} active={step.node}
      roleAt={i => (step.answer[i] ? 'palindrome' : '')} />
    <output aria-label="Current string">{step.node >= 0 ? `Node ${step.node} string: ${step.text}` : 'Waiting for the root'}</output>
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>Children are visited in increasing order, so each node string is its children's strings followed by its own letter.</p>
  </>} />
}
