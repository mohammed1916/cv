import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'De Bruijn graph', description: 'Model passwords as edges between length n-1 nodes.' },
    { id: 'visit', label: 'Take edge', description: 'Mark an unused password and recurse into its target node.' },
    { id: 'skip', label: 'Node exhausted', description: 'Every outgoing edge of this node is used.' },
    { id: 'emit', label: 'Emit digit', description: 'After returning from an edge, append its digit to the answer.' },
    { id: 'done', label: 'Complete', description: 'Append the starting prefix and return.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'n and k (JSON)',
  url: 'https://leetcode.com/problems/cracking-the-safe/',
  complexity: 'O(k^n) edges visited, each with O(n) string work. The visualization caps k^n at 500.',
  examples: [{ label: 'Example 1', input: '{"n": 1, "k": 2}' }, { label: 'Example 2', input: '{"n": 2, "k": 2}' }, { label: 'Three digits', input: '{"n": 3, "k": 3}' }],
}

export default function CrackingTheSafe() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <IndexedSequence label="Answer built so far (reverse order)" length={step.ans.length} active={step.ans.length - 1} valueAt={i => step.ans[i]} />
    <output aria-label="Current edge">Node: "{step.node || '(empty)'}" {step.edge ? `| edge: ${step.edge}` : ''} | depth {step.depth}</output>
    <output aria-label="Coverage">Passwords marked: {step.seen} / {step.total}</output>
  </>} renderReasoning={() => <>
    <p>Every node has k in-edges and k out-edges, so an Eulerian cycle exists. Hierholzer's DFS emits edges after exploring beyond them, producing the cycle in reverse; appending the n-1 starting zeros closes the string so the last passwords are complete.</p>
  </>} />
}
