import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin at the root with no best path.' },
    { id: 'visit', label: 'Combine', description: 'Join the two longest chains from children whose letters differ.' },
    { id: 'done', label: 'Complete', description: 'Report the longest path.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with parent and s (lowercase letters), for example {"parent":[-1,0,0,1],"s":"abac"}',
  url: 'https://leetcode.com/problems/longest-path-with-different-adjacent-characters/',
  complexity: 'O(n) time and O(n) space for the child lists and recursion. The visualization caps input at 12 nodes.',
  examples: [
    { label: 'Example 1', input: '{"parent":[-1,0,0,1,1,2],"s":"abacbe"}' },
    { label: 'Example 2', input: '{"parent":[-1,0,0,0],"s":"aabc"}' },
  ],
}

export default function LongestDifferentPath() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Letters by node" length={run.input.s.length} valueAt={i => run.input.s[i]} active={step.node ?? -1} roleAt={i => (step.chains[i] !== undefined ? `chain ${step.chains[i]}` : '')} />
    <output aria-label="Best path">{`Best path so far: ${step.best} nodes`}</output>
  </>} renderReasoning={() => <>
    <p>A path that turns at node v joins two downward chains. Each chain may only start with a child whose letter differs from v.</p>
    <p>Each node therefore reports one chain upward, and the best path through it uses its two longest usable chains.</p>
  </>} />
}
