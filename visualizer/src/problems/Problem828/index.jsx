import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Idea', description: 'Switch from substrings to per-character contributions.' },
    { id: 'bounds', label: 'Find neighbours', description: 'Locate the previous and next equal letters.' },
    { id: 'add', label: 'Add contribution', description: 'Multiply the start choices by the end choices.' },
    { id: 'done', label: 'Complete', description: 'Return the accumulated total.' },
  ],
  parse: parseInput, build: buildTrace, code, python, inputLabel: 'String of uppercase letters (JSON)',
  url: 'https://leetcode.com/problems/count-unique-characters-of-all-substrings-of-a-given-string/',
  complexity: 'O(n) time with precomputed neighbours (the shown code uses rfind/find, O(n * 26) in practice); O(1) extra space.',
  examples: [{ label: 'ABC', input: '"ABC"' }, { label: 'ABA', input: '"ABA"' }, { label: 'LEETCODE', input: '"LEETCODE"' }],
}
export default function UniqueCharacterSubstrings() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="String" length={run.input.length} active={step.index} valueAt={i => run.input[i]}
      roleAt={i => step.index >= 0 && step.phase !== 'done' && (i === step.left ? 'prev copy' : i === step.right ? 'next copy' : i > step.left && i < step.right && i !== step.index ? 'window' : '')} />
    <IndexedSequence label="Contribution of each position" length={run.input.length} active={step.phase === 'add' ? step.index : -1}
      valueAt={i => step.phase === 'done' || i < step.index || (i === step.index && step.phase === 'add') ? run.contributions[i] : '?'} />
    <output aria-label="Total">Total so far: {step.total}</output>
  </>} renderReasoning={({ step }) => <>
    <p>A substring counts a letter occurrence iff that occurrence is the only one of its letter inside it. That happens exactly when the substring starts after the previous equal letter and ends before the next one.</p>
    {step.phase !== 'start' && step.phase !== 'done' && <p>Start choices: {step.index - step.left}; end choices: {step.right - step.index}.</p>}
  </>} />
}
