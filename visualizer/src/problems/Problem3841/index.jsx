import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'setup', label: 'Tree', description: 'Build the adjacency lists.' },
    { id: 'update', label: 'Update', description: 'Change one node letter.' },
    { id: 'query', label: 'Path', description: 'Collect the letters on the path.' },
    { id: 'answer', label: 'Answer', description: 'Count the odd letter counts.' },
    { id: 'done', label: 'Result', description: 'Return every answer in order.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with n, edges, s and queries',
  url: 'https://leetcode.com/problems/palindromic-path-queries-in-a-tree/',
  complexity: 'Each query walks one path and counts its letters. The visual caps n at 12.',
  examples: [
    { label: 'Example', input: '{"n":4,"edges":[[0,1],[1,2],[1,3]],"s":"aabb","queries":["query 2 3","update 1 c","query 0 3"]}' },
    { label: 'Star', input: '{"n":3,"edges":[[0,1],[0,2]],"s":"xyz","queries":["query 1 2","update 0 y","query 1 2"]}' },
    { label: 'One node', input: '{"n":1,"edges":[],"s":"a","queries":["query 0 0"]}' },
    { label: 'Equal letters', input: '{"n":3,"edges":[[0,1],[1,2]],"s":"aaa","queries":["query 0 2","update 1 b","query 0 2"]}' },
    { label: 'Path of 12 nodes', input: '{"n":12,"edges":[[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,7],[7,8],[8,9],[9,10],[10,11]],"s":"abcdefghijkl","queries":["query 0 11","update 5 z","query 0 11"]}' },
    { label: 'Long run: 12 nodes and queries', input: '{"n":12,"edges":[[0,1],[0,2],[1,3],[1,4],[2,5],[3,6],[3,7],[1,8],[7,9],[6,10],[3,11]],"s":"lreqoqgkdrrq","queries":["query 11 3","query 1 10","update 11 x","query 4 1","query 0 7","update 3 y","query 0 10","query 7 10","update 0 x","query 10 1","query 10 11","update 7 z"]}' },
  ],
}

export default function PalindromicPathQueriesInATree() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <IndexedSequence label="Node letters" length={step.chars.length} valueAt={i => step.chars[i]} active={-1}
      roleAt={i => (step.path.includes(i) ? 'path' : '')} />
    <output aria-label="Path check">{step.odd === null ? 'No path counted yet.' : `Odd letter counts on the path: ${step.odd}`}</output>
  </>} renderReasoning={() => <>
    <p>A string can be rearranged into a palindrome exactly when at most one letter has an odd count.</p>
    <p>Each query only needs the letters on one tree path, so the path is found once per query and its counts are checked.</p>
  </>} />
}
