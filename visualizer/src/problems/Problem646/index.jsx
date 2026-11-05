import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IntervalView from '../../components/shared/IntervalView'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Sort by end', description: 'Order the pairs by their right value.' },
    { id: 'consider', label: 'Check next pair', description: 'Take the pair only if it starts strictly after the chain end.' },
    { id: 'take', label: 'Extend chain', description: 'The taken pair becomes the new chain end.' },
    { id: 'done', label: 'Answer', description: 'Return the number of taken pairs.' },
  ],
  parse: parseInput, build: buildTrace, code, python, inputLabel: 'Pairs (JSON array of [left, right])',
  url: 'https://leetcode.com/problems/maximum-length-of-pair-chain/',
  complexity: 'O(n log n) time for the sort and O(n) extra space for the sorted copy.',
  examples: [
    { label: 'Three steps', input: '[[1,3],[2,5],[4,6],[7,9]]' },
    { label: 'Overlap', input: '[[5,6],[1,2],[3,4],[2,3]]' },
    { label: 'Long nest', input: '[[-3,4],[0,2],[1,5],[6,8]]' },
  ],
}

export default function PairChain() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const intervals = step.sorted.map((pair, i) => ({
      start: pair[0], end: pair[1], group: 'pairs', label: `[${pair[0]}, ${pair[1]}]`,
      role: i === step.index ? (step.take ? 'merged' : 'current') : step.kept.includes(i) ? 'kept' : i < step.index ? 'rejected' : 'pending',
    }))
    return <>
      <IntervalView title="Pairs sorted by right end" intervals={intervals}
        marker={step.current === -Infinity ? null : step.current} markerLabel="chain end"
        note={`Chain length ${step.count}${step.current === -Infinity ? '' : `, ends at ${step.current}`}`} />
    </>
  }} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p><strong>Why the right end:</strong> finishing earliest leaves the most room for later pairs, so a greedy choice by right end is optimal.</p>
  </>} />
}
