import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import HashMapView from '../../components/shared/HashMapView'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Empty table', description: 'No digit sum has been seen yet.' },
    { id: 'scan', label: 'New digit sum', description: 'Store this number as the largest for its digit sum.' },
    { id: 'pair', label: 'Pair found', description: 'Pair this number with the largest earlier partner.' },
    { id: 'done', label: 'Answer', description: 'Report the best pair sum, or -1.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Numbers as JSON: {"nums": [...]}',
  url: 'https://leetcode.com/problems/max-sum-of-a-pair-with-equal-sum-of-digits/',
  complexity: 'O(n * d) time for n numbers of at most d digits, and O(n) space. The visualization caps input at 20 numbers.',
  examples: [
    { label: 'Own: four squares-like values', input: '{"nums":[9,4,25,16]}' },
    { label: 'Own: three values', input: '{"nums":[6,30,2]}' },
    { label: 'No equal digit sums', input: '{"nums":[1,2]}' },
    { label: 'Equal digit sums, largest pair', input: '{"nums":[9,18,27]}' },
    { label: 'Largest values near one billion', input: '{"nums":[1000000000,999999999,999999998,999999997,999999996,999999995,999999994,999999993,999999992,999999991,999999990,999999989,999999988,999999987,999999986,999999985,999999984,999999983,999999982,999999981]}' },
    { label: 'Long run: 20 numbers', input: '{"nums":[143715758,706784921,406307580,360195859,248053063,760658204,832455526,270272110,918620562,126169440,422193919,567667165,422847844,41988262,747832489,109765945,394898049,910804844,668244845,485143098]}' },
  ],
}

export default function MaxDigitSumPair() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <HashMapView maps={step.maps} ops={step.ops} />
    <output aria-label="Best pair so far">{`Best pair so far: ${step.result === -1 ? 'none' : step.result}`}</output>
  </>} renderReasoning={() => <>
    <p>Two numbers can only pair when their digit sums match, so the table is keyed by digit sum.</p>
    <p>For each digit sum, only the largest number matters: any other partner with that sum gives a smaller pair.</p>
  </>} />
}
