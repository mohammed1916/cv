import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { code, python, parseInput, buildTrace } from './algorithm'

const definition = {
  phases: [
    { id: 'init', label: 'Setup', description: 'Start both running totals at 0.' },
    { id: 'scan', label: 'Scan', description: 'Visit each number and its digits.' },
    { id: 'update', label: 'Update', description: 'Add to the element sum or the digit sum.' },
    { id: 'done', label: 'Result', description: 'Return the absolute difference.' },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Array object (JSON, e.g. {"nums": [1, 15, 6, 3]})',
  url: 'https://leetcode.com/problems/difference-between-element-sum-and-digit-sum-of-an-array/',
  complexity: 'O(n * d) time for n numbers with at most d digits each, O(1) extra space. The visualization caps the array at 2000 numbers.',
  examples: [
    { label: 'Nonzero difference', input: '{"nums": [1,15,6,3]}' },
    { label: 'Equal totals', input: '{"nums": [1,2,3,4]}' },
    { label: 'Single number', input: '{"nums":[1]}' },
    { label: 'Equal totals', input: '{"nums":[5,5,5,5]}' },
    { label: 'Largest values alternating', input: '{"nums":[2000,1,2000,1,2000,1]}' },
    { label: 'Long run: 200 numbers', input: '{"nums":[1722,381,1261,1230,1996,352,762,879,440,1974,608,522,587,1949,1835,1739,384,767,486,1118,181,601,255,1102,1764,295,1696,24,1498,196,502,1864,1202,798,1356,218,1994,1151,1487,217,44,419,1403,386,245,1896,1100,1105,481,1672,110,546,155,1088,796,416,880,1404,35,1144,284,375,463,1718,1371,270,1787,662,1944,157,1093,1219,976,1040,647,346,1199,851,1694,1783,1953,913,565,742,1633,1927,121,1602,1085,1537,1814,1976,943,378,1368,196,259,527,91,2,727,1820,10,717,85,333,1538,514,1050,1454,1007,1661,1057,250,1389,1258,1176,366,39,1236,1497,1702,1578,8,17,1341,194,194,1308,1104,410,78,757,11,1327,423,1721,1994,142,1930,244,376,560,899,1810,1171,1940,1261,1582,1941,740,1558,1605,1242,653,952,1331,80,827,960,932,49,1146,777,1475,890,85,145,686,839,89,1938,1374,1539,1218,361,1986,892,1051,321,1973,1612,370,1768,1266,271,449,1880,1558,659,500,14,92,2,521,1173,210,41,1706,1435]}' },
  ],
}

export default function DifferenceElementDigitSum() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => (
        <>
          <IndexedSequence
            label="Numbers"
            length={run.input.nums.length}
            active={step.index}
            valueAt={(i) => run.input.nums[i]}
            roleAt={(i) => (i < step.index ? 'done' : '')}
          />
          <output aria-label="Running totals">Element sum: {step.elementSum} · Digit sum: {step.digitSum}</output>
        </>
      )}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  )
}
