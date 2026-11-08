import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Input', description: 'The unsorted numbers.' },
    { id: 'sort', label: 'Sort', description: 'Sorting makes max and min positional.' },
    { id: 'powers', label: 'Powers of two', description: 'Precompute 2^i modulo 1e9+7.' },
    { id: 'term', label: 'Add contribution', description: 'Element i adds nums[i] * (2^i - 2^(n-1-i)).' },
    { id: 'done', label: 'Complete', description: 'Return the total width sum.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'nums (JSON array, up to 200 values)',
  url: 'https://leetcode.com/problems/sum-of-subsequence-widths/',
  complexity: 'O(n log n) time for sorting plus O(n) for the sum; O(n) space for powers of two.',
  examples: [
    { label: 'Official', input: '[2,1,3]' },
    { label: 'Single', input: '[2]' },
    { label: 'Duplicates', input: '[5,69,89,92,31,16,25,45,63,40,16,56,24,40,75,82,40,12,50,62,92,44,67,38,92,22,91,24,26,21,100,42,23,56,64,43,95,76,84,79,89,4,16,94,16,77,92,9,30,13]' },
    { label: 'Minimum value 1', input: '[1]' },
    { label: 'Equal values', input: '[3,3,3,3]' },
    { label: 'Largest values', input: '[100000,1,100000,1]' },
    { label: 'Long run: 200 items', input: '[5434,48049,39968,81842,48327,75762,96563,44133,13900,21788,35609,75899,88153,19061,15259,74300,8736,11765,11093,31888,49348,25139,6274,53915,12637,70402,73229,94904,31996,37758,24800,87042,29625,27515,61597,76396,14644,43225,69556,11954,61106,73196,84565,63493,17348,44964,44962,51692,29037,18243,2568,95443,83430,14291,52745,26237,78409,8164,89511,8115,52093,56806,75740,64755,48632,19736,13406,47542,64935,71418,15975,67011,25939,76963,47769,89415,45071,45359,37127,57863,80529,44270,31887,17811,25768,81318,72885,1564,45095,66420,27786,26358,76269,11333,54500,99554,50823,23794,29438,12281,56331,98810,19672,85221,81357,60885,43222,96898,3198,46537,38802,76326,67117,48166,87928,80827,6151,34671,47600,19516,106,55559,5311,99597,34375,4593,69307,13088,63630,23482,37962,56524,38194,54611,96825,81979,11106,6339,20280,95792,38172,99376,39524,26584,91672,25909,82750,95291,49121,24986,69779,43208,27728,46644,49456,3260,34813,46568,70750,82937,79809,59804,93194,83430,17057,89644,58280,37628,57909,24973,69770,23821,30853,37595,58336,20052,61689,98520,15490,85317,23562,72927,10353,78665,64546,39460,38401,83750,85916,22059,34470,35607,77575,17151,80975,50767,58326,62632,23835,73191]' },
  ],
}

export default function SumOfSubsequenceWidths() {
  return <AlgorithmWorkspace definition={definition}
    renderVisual={({ run, step }) => <>
      <IndexedSequence label={step.phase === 'start' ? 'nums (unsorted)' : 'nums (sorted)'} length={step.nums.length} valueAt={i => step.nums[i]} active={step.index}
        roleAt={i => (step.index >= 0 && i < step.index ? 'done' : '')} />
      {step.phase !== 'start' && step.phase !== 'sort' && <IndexedSequence label="Powers of two mod 1e9+7" length={run.pow2.length} valueAt={i => run.pow2[i]} active={step.index} />}
      {step.contributions.length > 0 && <IndexedSequence label="Coefficient 2^i - 2^(n-1-i) mod p" length={step.contributions.length} valueAt={i => step.contributions[i]} active={step.index} />}
      <output aria-label="Running sum">Running sum: {step.ans}</output>
    </>}
    renderReasoning={({ step }) => <>
      <p>{step.message}</p>
      <p><strong>Counting argument:</strong> in the sorted array, element i is the maximum of every subsequence that uses it plus any subset of the i smaller elements (2^i of them), and the minimum for any subset of the n-1-i larger ones. Summing max minus min over all subsequences therefore weights nums[i] by 2^i - 2^(n-1-i).</p>
    </>} />
}
