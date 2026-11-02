import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin with the last element as the suffix.' },
    { id: 'compare', label: 'Compare', description: 'Check the pair left of the suffix start.' },
    { id: 'extend', label: 'Extend', description: 'The pair is increasing, so the suffix grows left.' },
    { id: 'done', label: 'Result', description: 'Report how many elements were removed.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON array of integers',
  url: 'https://leetcode.com/problems/minimum-prefix-removal-to-make-array-strictly-increasing/',
  complexity: 'O(n) time and O(1) extra space. The scan walks left once from the end.',
  examples: [
    { label: 'Example', input: '[1, 3, 2, 4]' },
    { label: 'Already increasing', input: '[1, 2, 3]' },
    { label: 'Decreasing', input: '[5, 4, 3]' },
  ],
}

export default function MinimumPrefixRemoval() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="nums" length={run.input.nums.length} valueAt={i => run.input.nums[i]} active={step.k ?? -1}
      roleAt={i => (step.k !== undefined && i >= step.k ? 'window' : (step.cmp !== undefined && i === step.cmp ? 'window' : ''))} />
    <output aria-label="Suffix start">{`suffix starts at ${step.k ?? 'none'}, remove ${step.k ?? 0} prefix element${step.k === 1 ? '' : 's'}`}</output>
  </>} renderReasoning={() => <>
    <p>The suffix must be strictly increasing. Starting at the end and moving left, the suffix can keep growing as long as each new element is smaller than the one after it.</p>
    <p>The first pair that breaks the order fixes the start of the suffix, and everything before it must be removed.</p>
  </>} />
}
