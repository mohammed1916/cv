import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { phases, parseInput, buildTrace, code, python, pythonLineMap } from './algorithm'

const definition = {
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  pythonLineMap,
  inputLabel: 'JSON object with "cards" and "k" (e.g. {"cards": [3, 1, 6, 8, 2, 9], "k": 3})',
  url: 'https://leetcode.com/problems/maximum-points-you-can-obtain-from-cards/',
  complexity: 'O(k) time and O(1) extra space: the window of left and right cards is updated by one swap per step.',
  examples: [
    { label: 'Sample', input: '{"cards": [3, 1, 6, 8, 2, 9], "k": 3}' },
    { label: 'Four cards', input: '{"cards": [5, 7, 1, 9], "k": 2}' },
    { label: 'Take all', input: '{"cards": [4, 4, 4], "k": 3}' },
    { label: 'One card', input: '{"cards":[5],"k":1}' },
    { label: 'Equal cards', input: '{"cards":[4,4,4,4],"k":2}' },
    { label: 'Largest values allowed', input: '{"cards":[10000,1,10000,1],"k":4}' },
    { label: 'Long run: 200 cards', input: '{"cards":[37,603,835,666,432,464,489,189,128,886,198,318,69,743,363,806,422,317,169,633,516,408,767,30,626,676,629,710,52,699,728,685,721,55,362,2,422,769,646,356,808,449,279,155,44,451,495,241,745,512,942,617,801,693,453,488,872,350,877,147,121,688,351,979,913,664,73,223,227,239,712,571,872,174,987,462,919,701,405,720,752,589,224,270,390,398,710,231,621,92,959,548,468,280,559,591,714,963,770,90,434,801,263,55,459,669,191,709,981,45,900,293,191,365,447,686,16,476,468,675,972,708,83,18,831,92,978,44,427,727,31,197,943,531,467,904,116,20,897,87,517,280,573,198,171,754,713,930,819,122,120,606,715,74,1,78,444,145,806,241,906,137,946,906,901,944,990,370,336,402,783,835,539,73,87,623,20,962,601,245,660,407,788,85,473,92,535,179,147,445,731,743,541,136,830,242,797,77,605,24],"k":60}' },
  ],
}

function CardsScene({ run, step }) {
  const { cards } = run.input
  const snap = step.snapshot
  const n = cards.length
  const k = run.input.k
  // The left pointer marks the rightmost card currently taken from the left; the right pointer marks the newest card taken from the right.
  const role = i => {
    if (i === snap.added) return 'r'
    if (i === snap.removed) return 'l'
    if (i < snap.leftCount || i >= n - snap.rightCount) return 'window'
    return ''
  }
  return <>
    <IndexedSequence label="Cards in a row" length={n} valueAt={i => cards[i]} active={snap.added >= 0 ? snap.added : -1}
      roleAt={role} />
    <p>Cards taken: {k}. The left pointer is on card {snap.removed >= 0 ? snap.removed : k - 1} and the right pointer is on card {snap.added >= 0 ? snap.added : n - 1}.</p>
    <p>Taken from left: {snap.leftCount} · from right: {snap.rightCount} · total: {snap.total} · best: {snap.best}</p>
  </>
}

export default function CardPoints() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <CardsScene run={run} step={step} />}
      renderReasoning={({ step }) => <p>{phases.find(p => p.id === step.phase)?.description}</p>}
    />
  )
}
