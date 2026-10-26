import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Input', description: 'Pick row n and position k.' },
    { id: 'descend', label: 'Go to parent', description: 'Map position k to ceil(k/2) one row up.' },
    { id: 'base', label: 'Row 1', description: 'The first row is 0.' },
    { id: 'resolve', label: 'Resolve', description: 'Copy the parent for odd positions, flip it for even positions.' },
    { id: 'done', label: 'Complete', description: 'Return the symbol.' },
  ],
  parse: parseInput, build: buildTrace, code, inputLabel: 'Object {n, k} (JSON, n up to 30)',
  url: 'https://leetcode.com/problems/k-th-symbol-in-grammar/',
  complexity: 'O(n) time and O(n) recursion depth.',
  examples: [
    { label: 'n=1, k=1 -> 0', input: '{"n":1,"k":1}' },
    { label: 'n=2, k=1 -> 0', input: '{"n":2,"k":1}' },
    { label: 'n=2, k=2 -> 1', input: '{"n":2,"k":2}' },
    { label: 'n=5, k=11', input: '{"n":5,"k":11}' },
    { label: 'n=30, k=434991989', input: '{"n":30,"k":434991989}' },
  ],
}
export default function KthSymbolInGrammar() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Row number of each ancestor (child to root)" length={run.chain.length} active={step.depth} valueAt={i => run.chain[i].row} />
    <IndexedSequence label="Position within that row" length={run.chain.length} active={step.depth} valueAt={i => run.chain[i].pos} roleAt={i => (run.chain[i].pos % 2 ? 'odd' : 'even')} />
    <IndexedSequence label="Symbol (resolved bottom-up)" length={run.chain.length} active={step.depth} valueAt={i => (step.values[i] === null ? '?' : step.values[i])} />
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p><strong>Structure:</strong> each symbol in row r expands to two in row r+1, so position k descends from position ceil(k/2). The expansion 0 to 01 and 1 to 10 makes the first child equal the parent and the second its complement.</p>
  </>} />
}
