import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Ends', description: 'l starts at the first letter and r at the last.' },
    { id: 'match', label: 'Match ends', description: 'Equal ends move both pointers inward.' },
    { id: 'mismatch', label: 'First mismatch', description: 'Only here can one deletion help: test both options.' },
    { id: 'done', label: 'Answer', description: 'Report whether one deletion is enough.' },
  ],
  parse: parseInput, build: buildTrace, code, python, inputLabel: 'Word (JSON string of lowercase letters)',
  url: 'https://leetcode.com/problems/valid-palindrome-ii/',
  complexity: 'O(n) time and O(1) extra space: at most two linear checks after the first mismatch.',
  examples: [
    { label: 'One drop', input: '"racecarx"' },
    { label: 'Mirror pair', input: '"abcdba"' },
    { label: 'No help', input: '"abcde"' },
  ],
}

export default function ValidPalindromeII() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Letters" length={run.input.length} active={step.l} valueAt={i => run.input[i]}
      roleAt={i => (i === step.l && i === step.r ? 'l = r' : i === step.l ? 'l' : i === step.r ? 'r' : i < step.l || i > step.r ? 'settled' : '')} />
    <output aria-label="Pointers">{`l ${step.l} · r ${step.r}${step.result === undefined ? '' : ` · result ${step.result}`}`}</output>
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p><strong>Why only one branch:</strong> after a deletion the remaining text must be a palindrome, and the first mismatch is the only place where the two choices differ.</p>
  </>} />
}
