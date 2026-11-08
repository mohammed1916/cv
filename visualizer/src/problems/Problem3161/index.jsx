import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Free cells', description: 'Every cell 0 to 15 starts free.' },
    { id: 'obstacle', label: 'Obstacle', description: 'Block one cell and update its path in the tree.' },
    { id: 'check', label: 'Check block', description: 'Read the longest free run inside [0, x].' },
    { id: 'done', label: 'Complete', description: 'Report the answers.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Queries as JSON [[1, x] obstacle or [2, x, size] check], x from 0 to 15',
  url: 'https://leetcode.com/problems/block-placement-queries/',
  complexity: 'O(log M) per query with the segment tree over M cells. The visualization fixes M at 16.',
  examples: [
    { label: 'Example 1', input: '[[1,2],[2,3,3],[2,3,1],[2,2,2]]' },
    { label: 'Example 2', input: '[[2,0,1],[2,1,2]]' },
    { label: "Obstacle at the start", input: "[[1,0]]" },
    { label: "Full-width block check", input: "[[1,15],[2,15,16]]" },
    { label: "Long run: twelve queries", input: "[[1,3],[2,7,4],[1,8],[2,15,5],[1,0],[2,4,2],[1,12],[2,11,6],[1,6],[2,9,1],[1,14],[2,15,16]]" },
  ],
}

export default function BlockPlacementQueries() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <IndexedSequence label="Cells 0 to 15 (blocked marked)" length={16} active={step.window ?? -1}
      valueAt={i => (step.blocked[i] ? 'X' : '.')} roleAt={i => (step.window !== null && i <= step.window ? 'in range' : '')} />
    <output aria-label="Answer">{step.answer === null ? 'No check yet' : `Block fits: ${step.answer} (longest free run ${step.longest})`}</output>
    <p>{step.message}</p>
  </>} renderReasoning={() => <>
    <p>Each tree node knows its free prefix, free suffix, and longest free run. Two neighbouring ranges join by extending a run across their boundary.</p>
    <p>A check combines the nodes that cover cells 0 to x, and the longest run in that combined summary decides whether the block fits.</p>
  </>} />
}
