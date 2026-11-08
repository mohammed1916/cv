import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'try', label: 'Reversals', description: 'Try one prefix or suffix reversal.' },
    { id: 'done', label: 'Result', description: 'The smallest candidate.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON string of lowercase letters',
  url: 'https://leetcode.com/problems/lexicographically-smallest-string-after-reverse/',
  complexity: 'O(n^2) time in this direct version, which builds all 2n candidates.',
  examples: [
    { label: 'Example', input: '"gfec"' },
    { label: 'Reverse', input: '"mkj"' },
    { label: 'Single letter', input: '"z"' },
    { label: 'Repeated letters', input: '"aaaa"' },
    { label: 'Longest string', input: '"zyxwvutsrqzyxwvutsrqzyxwvutsrqzyxwvutsrqzyxwvutsrq"' },
    { label: 'Long run: 50 letters', input: '"fstqxgpcxghujufkzkxuvkzajidstotajyrijefyjudyjqjgrq"' },
  ],
}

export default function LexicographicallySmallestAfterReverse() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="original letters" length={run.input.s.length} valueAt={i => run.input.s[i]} active={-1}
      roleAt={i => (step.k === null ? '' : (step.side === 'front' ? (i < step.k ? 'reversed' : '') : (i >= run.input.s.length - step.k ? 'reversed' : '')))} />
    <output aria-label="Candidate">{step.k === null ? `best ${step.best}` : `candidate ${step.candidate}; best ${step.best}`}</output>
  </>} renderReasoning={() => <>
    <p>Exactly one operation is required, so the answer is the smallest string among all prefix reversals and all suffix reversals.</p>
    <p>Trying each length in both directions covers every allowed result.</p>
  </>} />
}
