import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Sort', description: 'Sort and take the no-shift range as the baseline.' },
    { id: 'split', label: 'Try split', description: 'Prefix gets +k, suffix gets -k; compute the range.' },
    { id: 'improve', label: 'New best', description: 'This split beats the best range so far.' },
    { id: 'done', label: 'Complete', description: 'Return the smallest range.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object {nums, k} (JSON)',
  url: 'https://leetcode.com/problems/smallest-range-ii/',
  complexity: 'O(n log n) time for the sort, then O(n) for the splits. nums is capped at 100 values.',
  examples: [
    { label: 'Three numbers, small k', input: '{"nums":[2,8,5],"k":2}' },
    { label: 'Almost equal values', input: '{"nums":[10,10,10,11],"k":1}' },
    { label: 'Evenly spaced values', input: '{"nums":[0,6,12,18],"k":4}' },
    { label: 'Larger', input: '{"nums":[7,8,8,5,2],"k":4}' },
    { label: 'Single zero', input: '{"nums":[0],"k":0}' },
    { label: 'Equal values', input: '{"nums":[4,4,4,4],"k":4}' },
    { label: 'Largest values', input: '{"nums":[10000,0,10000],"k":10000}' },
    { label: 'Long run: 100 values', input: '{"nums":[6449,4591,4699,7202,740,7986,304,9670,5174,1051,6634,2967,7503,4661,3910,9991,5989,4798,4191,7395,3308,4442,9758,4990,4915,1294,5031,6756,8556,4200,4890,1030,4658,512,7904,3822,4242,3837,5812,1837,5643,4079,6061,3786,1148,1860,8281,1902,5828,4725,5503,7214,173,4716,213,7005,7417,5055,6000,5575,6282,8008,1769,5966,299,894,2350,6762,8560,562,3900,1080,163,2497,7350,7722,994,6905,9744,1232,4120,9989,1276,5324,1947,1297,4449,4116,3571,5713,3798,3207,3160,6660,9672,1620,7036,5972,2728,6911],"k":5000}' },
  ],
}

export default function SmallestRangeII() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Sorted nums (left of split: +k, right: -k)" length={run.sorted.length} active={step.split} valueAt={i => run.sorted[i]}
      roleAt={i => step.split < 0 ? '' : i <= step.split ? 'plus' : 'minus'} />
    <output aria-label="Range">{step.range === undefined ? '' : `This split: ${step.low} to ${step.high} (range ${step.range}). `}Best range: {step.ans}</output>
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>If a larger value were lowered while a smaller one was raised, swapping the choices never widens the range, so the optimum raises a prefix of the sorted array and lowers the rest.</p>
  </>} />
}
