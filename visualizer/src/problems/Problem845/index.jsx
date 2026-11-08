import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Input', description: 'Create the up and down run-length arrays.' },
    { id: 'up', label: 'Uphill pass', description: 'Left to right: extend the climb or reset it.' },
    { id: 'down', label: 'Downhill pass', description: 'Right to left: extend the descent or reset it.' },
    { id: 'skip', label: 'Not a peak', description: 'The index lacks a climb or a descent.' },
    { id: 'peak', label: 'Peak', description: 'Join climb and descent into a mountain length.' },
    { id: 'done', label: 'Complete', description: 'Return the longest mountain length.' },
  ],
  parse: parseInput, build: buildTrace, code, python, inputLabel: 'Array arr (JSON)',
  url: 'https://leetcode.com/problems/longest-mountain-in-array/',
  complexity: 'O(n) time and O(n) space for the two run-length arrays (an O(1) two-pointer version also exists).',
  examples: [
    { label: 'Eight values, mixed', input: '[1,5,2,8,4,3,9,0]' },
    { label: 'Runs of repeated values', input: '[0,0,7,7,7,0]' },
    { label: 'Two mountains', input: '[0,1,2,1,0,3,5,6,2,1,1,4,3]' },
    { label: 'Single value', input: '[1]' },
    { label: 'Equal values, flat', input: '[2,2,2]' },
    { label: 'Largest values in a 60-long mountain', input: '[0,300,600,900,1200,1500,1800,2100,2400,2700,3000,3300,3600,3900,4200,4500,4800,5100,5400,5700,6000,6300,6600,6900,7200,7500,7800,8100,8400,8700,8700,8400,8100,7800,7500,7200,6900,6600,6300,6000,5700,5400,5100,4800,4500,4200,3900,3600,3300,3000,2700,2400,2100,1800,1500,1200,900,600,300,0]' },
    { label: 'Long run: 60 random values', input: '[7057,8066,695,3235,3505,4205,6269,529,7580,4956,5540,5009,5733,1839,1091,882,9452,2030,5848,5390,5658,2765,4624,4735,3715,4018,332,2765,7856,7524,8882,2032,4262,6899,5701,4290,2271,2070,2218,1287,4881,9987,7992,6168,4429,2053,7225,5665,5402,6459,1320,8304,7932,465,2845,4966,9901,5133,378,1916]' },
  ],
}
export default function LongestMountain() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="arr" length={run.input.length} active={step.index} valueAt={i => run.input[i]} roleAt={i => (step.up[i] && step.down[i] ? 'peak' : '')} />
    <IndexedSequence label="up (climb steps ending here)" length={run.input.length} active={step.index} valueAt={i => step.up[i]} />
    <IndexedSequence label="down (descent steps starting here)" length={run.input.length} active={step.index} valueAt={i => step.down[i]} />
    <output aria-label="Best">{step.phase === 'done' ? 'Longest mountain' : 'Best so far'}: {step.best}</output>
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p><strong>Why it works:</strong> a mountain is a strict climb followed by a strict descent around a peak. A peak at i extends up[i] steps left and down[i] steps right, so its length is up[i] + down[i] + 1, valid only when both are positive.</p>
  </>} />
}
