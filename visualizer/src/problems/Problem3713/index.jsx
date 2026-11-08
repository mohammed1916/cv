import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'No balanced substring is known yet.' },
    { id: 'window', label: 'Start index', description: 'Fix the first index of the substring.' },
    { id: 'extend', label: 'Extend', description: 'Add the next letter and update its count.' },
    { id: 'check', label: 'Check', description: 'Test whether every count is equal.' },
    { id: 'update', label: 'Update', description: 'Keep the longer balanced substring.' },
    { id: 'done', label: 'Result', description: 'Report the longest balanced length.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with s (lowercase letters)',
  url: 'https://leetcode.com/problems/longest-balanced-substring-i/',
  complexity: 'O(n^2) substrings, each checked from running counts. The visualization caps s at 20 characters.',
  examples: [
    { label: 'Whole string', input: '{"s":"abba"}' },
    { label: 'Prefix wins', input: '{"s":"abbac"}' },
    { label: 'Single letter', input: '{"s":"a"}' },
    { label: 'Repeated letter', input: '{"s":"aaaa"}' },
    { label: 'Longest string', input: '{"s":"abbaabbaabbaabbaabba"}' },
    { label: 'Long run: 20 letters', input: '{"s":"caaebeadceaacebddbac"}' },
  ],
}

export default function LongestBalancedSubstringI() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="s" length={run.input.s.length} valueAt={i => run.input.s[i]} active={step.at}
      roleAt={i => (step.start >= 0 && step.at >= 0 && i === step.start ? 'l' : step.start >= 0 && step.at >= 0 && i === step.at ? 'r' : step.start >= 0 && step.at >= 0 && i > step.start && i < step.at ? 'window' : '')} />
    <output aria-label="Balance state">{`start ${step.start >= 0 ? step.start : 'none'}, best ${step.best}, ${step.ok === false ? 'unbalanced' : step.ok ? 'balanced' : 'scanning'}`}</output>
  </>} renderReasoning={() => <>
    <p>Every substring is considered by fixing its start and growing its end, so the letter counts can be updated one letter at a time.</p>
    <p>A substring is balanced exactly when all letters that appear in it have the same count.</p>
  </>} />
}
