import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import MatrixGrid from '../../components/shared/MatrixGrid'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin with every index unassigned.' },
    { id: 'assign', label: 'Assign', description: 'Give a new letter to an index and every index it shares a prefix with.' },
    { id: 'verify', label: 'Verify', description: 'Rebuild the LCP table of the candidate word.' },
    { id: 'done', label: 'Result', description: 'Return the word, or an empty string.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with lcp (a square matrix)',
  url: 'https://leetcode.com/problems/find-the-string-with-lcp/',
  complexity: 'O(n * n) time and space for the table. The visualization caps the matrix at 6 by 6.',
  examples: [
    { label: 'Word aba', input: '{"lcp":[[3,0,1],[0,2,0],[1,0,1]]}' },
    { label: 'Two pairs', input: '{"lcp":[[4,1,0,0],[1,3,0,0],[0,0,2,1],[0,0,1,1]]}' },
    { label: 'Impossible', input: '{"lcp":[[2,2],[2,2]]}' },
  ],
}

export default function FindStringWithLcp() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <MatrixGrid label="LCP" matrix={run.input.lcp} activeCell={step.at >= 0 ? { row: step.at, col: step.at } : null}
      highlightedCells={run.input.lcp.flatMap((row, r) => row.map((_, c) => ({ r, c }))).filter(({ r, c }) => step.word[r] && step.word[r] === step.word[c]).map(({ r, c }) => ({ row: r, col: c }))} />
    <ol aria-label="Letters assigned to each index" style={{ display: 'flex', gap: 6, listStyle: 'none', padding: 0, color: 'var(--text)' }}>
      {step.word.map((c, i) => <li key={i} style={{ padding: '4px 8px', borderRadius: 6, background: i === step.at ? 'var(--primary)' : 'var(--surface2)' }}>[{i}] {c || '_'}</li>)}
    </ol>
    <output aria-label="Candidate word">{`word: ${step.word ? step.word.map(c => c || '_').join('') : ''}`}</output>
    <p role="status" style={{ color: 'var(--text)' }}>{step.message}</p>
  </>} renderReasoning={() => <>
    <p>If lcp[i][j] is positive, the letters at i and j must be equal. Greedy gives every such group its own letter.</p>
    <p>A given matrix can still be wrong, so the candidate is checked by rebuilding its LCP table and comparing every cell.</p>
  </>} />
}
