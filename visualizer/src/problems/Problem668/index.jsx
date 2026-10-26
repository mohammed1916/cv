import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Value range', description: 'The answer lies between 1 and m·n.' },
    { id: 'count', label: 'Count ≤ mid', description: 'Count products no larger than the midpoint.' },
    { id: 'done', label: 'Complete', description: 'The search has converged.' },
  ],
  parse: parseInput, build: buildTrace, code, inputLabel: 'Table (JSON object with m, n and k)',
  url: 'https://leetcode.com/problems/kth-smallest-number-in-multiplication-table/',
  complexity: 'O(m · log(m·n)) time and O(1) extra space.',
  examples: [
    { label: '3×3 fifth', input: '{"m":3,"n":3,"k":5}' },
    { label: '2×3 sixth', input: '{"m":2,"n":3,"k":6}' },
    { label: 'Large', input: '{"m":30,"n":30,"k":500}' },
  ],
}

export default function KthMultiplication() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <output aria-label="Search state">Range [{step.lo}, {step.hi}]{step.mid !== null && step.mid !== undefined ? ` · mid ${step.mid} · ${step.count} products ≤ mid (k = ${run.input.k})` : ''}</output>
  </>} renderReasoning={({ run, step }) => <>
    <p>{step.message}</p>
    <p><strong>Counting rule:</strong> row i (1-based) contributes min(n, ⌊mid / i⌋) products ≤ mid, so one division per row counts them all.</p>
    <p>The answer is the smallest v with at least {run.input.k} products ≤ v.</p>
  </>} />
}
