import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin with no qualifying pair; the answer is at least 0.' },
    { id: 'check', label: 'Pair', description: 'Test a pair of indices; a non-zero AND disqualifies it.' },
    { id: 'best', label: 'Best', description: 'A qualifying pair with a larger product replaces the best so far.' },
    { id: 'done', label: 'Complete', description: 'Report the best product.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON array of integers from 1 to 1000000',
  url: 'https://leetcode.com/problems/maximum-product-of-two-integers-with-no-common-bits/',
  complexity: 'O(n^2) time in this visualization. The official limit is 10^5 values, so an efficient solution uses bit DP.',
  examples: [
    { label: 'Own case 1', input: '[2,3,4,5,6,7,8]' },
    { label: 'Own case 2', input: '[65,9,33]' },
    { label: 'Two values', input: '[1,1]' },
    { label: 'Equal values', input: '[6,6,6]' },
    { label: 'Largest values', input: '[1000000,1,1000000,1,1000000,1,1000000,1,1000000,1,1000000,1]' },
    { label: 'Long run: 12 values', input: '[45874,707592,725483,689420,288907,91167,188171,458617,259722,8999,271466,747497]' },
  ],
}

export default function MaxProductNoCommonBits() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const roleAt = i => (step.bestPair && step.bestPair.includes(i) ? 'best' : '')
    return <>
      <IndexedSequence label="nums" length={run.input.length} valueAt={i => run.input[i]} active={step.i} roleAt={roleAt} />
      <output aria-label="Pair">{`Pair under test: ${step.i >= 0 ? `[${step.i}, ${step.j}]` : 'none'}. Best product: ${step.best}`}</output>
    </>
  }} renderReasoning={() => <>
    <p>Two values share no set bit exactly when their bitwise AND is zero. Only those pairs can be counted.</p>
    <p>The product of a qualifying pair is kept only if it beats the best so far, so the final value is the largest such product.</p>
  </>} />
}
