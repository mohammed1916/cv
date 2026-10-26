import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Pair distances', description: 'Compute all six squared distances.' },
    { id: 'sort', label: 'Sort', description: 'Order distances from smallest to largest.' },
    { id: 'done', label: 'Decide', description: 'Check sides and diagonals.' },
  ],
  parse: parseInput, build: buildTrace, code, inputLabel: 'Four points (JSON array of [x,y])',
  url: 'https://leetcode.com/problems/valid-square/',
  complexity: 'O(1) time: six pairs and one sort of six values.',
  examples: [
    { label: 'Unit square', input: '[[0,0],[1,1],[1,0],[0,1]]' },
    { label: 'Rotated', input: '[[0,0],[1,1],[1,0],[0,12]]' },
    { label: 'Duplicate point', input: '[[1,0],[-1,0],[0,1],[0,1]]' },
  ],
}

export default function ValidSquare() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Squared distances, sorted (smallest first)" length={step.sorted.length || 6} active={-1}
      valueAt={i => step.sorted[i] ? `${step.sorted[i].a}–${step.sorted[i].b}: ${step.sorted[i].d}` : '…'}
      roleAt={i => (i < 4 ? 'side' : 'diagonal')} />
    <output aria-label="Square decision">{step.phase === 'done' ? `Square: ${String(run.result)}` : 'Pending'}</output>
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p><strong>Test:</strong> four equal positive sides and two equal diagonals, each diagonal being twice a side in squared length.</p>
  </>} />
}
