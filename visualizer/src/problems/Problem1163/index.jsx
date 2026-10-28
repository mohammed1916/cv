import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin with candidate starts 0 and 1.' },
    { id: 'match', label: 'Match', description: 'The two suffixes agree so far, so compare the next letter.' },
    { id: 'move-i', label: 'Move i', description: 'The challenger wins, so the block at the candidate start is discarded.' },
    { id: 'move-j', label: 'Move j', description: 'The candidate wins, so the challenger block is discarded.' },
    { id: 'done', label: 'Complete', description: 'Return the suffix at the best start.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'String (JSON object with s)',
  url: 'https://leetcode.com/problems/last-substring-in-lexicographical-order/',
  complexity: 'O(n) time and O(1) extra space. The visualization caps input at 40 letters.',
  examples: [
    { label: 'Example', input: '{"s":"leetcode"}' },
    { label: 'Repeat', input: '{"s":"abab"}' },
  ],
}

export default function LastSubstringInLexicographicalOrder() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const roles = i => {
      if (i === step.i) return 'candidate'
      if (i === step.j) return 'challenger'
      if (step.k > 0 && (i >= step.i && i < step.i + step.k || i >= step.j && i < step.j + step.k)) return 'matched'
      return ''
    }
    return <>
      <IndexedSequence label="String" length={run.input.s.length} valueAt={i => run.input.s[i]} active={step.i} roleAt={roles} />
      <output aria-label="Comparison">{`Candidate ${step.i}, challenger ${step.j}, matched ${step.k}`}</output>
    </>
  }} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>Only two suffixes are ever kept. Whenever one loses, every start up to the point of difference is discarded.</p>
  </>} />
}
